import { Message } from "../../../../../common/models/message";
import { IRuntime, Port } from "../../../../../common/runtime/i-runtime";
import { EventEmitter } from "../../event-emitter";
import Logger from "../../utils/logger";

export enum PortManagerEvents {
    PORT_MESSAGE = "port-message",
    POPUP_DISCONNECTED = "popup-port-closed",
    CONTENT_DISCONNECTED = "content-port-closed",
    POPUP_CONNECTED = "popup-port-opened",
    CONTENT_CONNECTED = "content-port-opened",
}

export class PortManager extends EventEmitter {
    private _runtime: IRuntime | null = null;
    private _contentScriptPorts: Port[] = [];
    private _popupPorts: Port[] = [];

    private _logger = new Logger("PortManagerService");

    constructor(runtime: IRuntime) {
        super();
        this._runtime = runtime;
        this._listenToConnection();
    }

    connected() {
        return (
            this._contentScriptPorts.length > 0 || this._popupPorts.length > 0
        );
    }

    sendContentMessage(message: any) {
        this._contentScriptPorts.forEach((port) => {
            port.postMessage(message);
        });
    }

    sendPopupMessage(message: any) {
        this._popupPorts.forEach((port) => {
            port.postMessage(message);
        });
    }

    broadcastMessage(message: Message) {
        this.sendContentMessage(message);
        this.sendPopupMessage(message);
    }

    // NEW CONTENT SCRIPT OPENED
    private _addContentScriptPort(port: Port) {
        this._contentScriptPorts.push(port);
        port.onMessage.addListener(this._handlePortMessage.bind(this));
        port.onDisconnect.addListener(() => {
            this._logger.log("Content script port disconnected");
            this._removeContentScriptPort(port);
        });

        port.postMessage({ type: "ack" } as Message);

        this._logger.log("Content script connected");
        this.emit(PortManagerEvents.CONTENT_CONNECTED);
    }

    // CONTENT SCRIPT CLOSED
    private _removeContentScriptPort(port: Port) {
        this._contentScriptPorts = this._contentScriptPorts.filter(
            (item) => item !== port,
        );
        this._logger.log("Content script closed");
        this.emit(PortManagerEvents.CONTENT_DISCONNECTED);
    }

    private _addPopupPort(port: Port) {
        this._popupPorts.push(port);
        port.onMessage.addListener(this._handlePortMessage.bind(this));
        port.onDisconnect.addListener(() => {
            this._removePopupPort(port);
        });

        port.postMessage({ type: "ack" });

        this._logger.log("Popup opened");
        this.emit(PortManagerEvents.POPUP_CONNECTED);
    }

    private _removePopupPort(port: Port) {
        this._popupPorts = this._popupPorts.filter((item) => item !== port);

        this._logger.log("Popup closed");
        this.emit(PortManagerEvents.POPUP_DISCONNECTED);
    }

    private _handlePortMessage(msg: any) {
        this.emit(PortManagerEvents.PORT_MESSAGE, msg);
    }

    private _listenToConnection() {
        if (this._runtime) {
            this._runtime.onConnect.addListener((port: Port) => {
                this._logger.log("Received port connection " + port.name);
                switch (port.name) {
                    case "popup":
                        this._addPopupPort(port);
                        break;
                    case "content-script":
                        this._addContentScriptPort(port);
                        break;
                }
            });
        }
    }
}
