import { CoreServices } from "./services/core-services";
import { ConfigService } from "./services/config/config-service";
import { HTTPService } from "./services/http/http-service";
import { MessagingService } from "./services/messaging/messaging-service";
import { PluginMessagingService } from "./services/messaging/plugin-messaging-service";
import { NotificationService } from "./services/notifications/notification-service";
import { StorageService } from "./services/storage/storage-service";
import { WindowService } from "./services/windows/window-service";

const BGServices = {
    CoreServices,
    ConfigService,
    HTTPService,
    MessagingService,
    PluginMessagingService,
    NotificationService,
    StorageService,
    WindowService,
};

import urlJoin from "./utils/url-join";
import Logger from "./utils/logger";

const utils = {
    urlJoin,
    Logger,
};

import { PluginRegistry } from "./plugin/plugin-registry";
import { CoreEvents } from "./core-events";
import { BackgroundApp } from "./background-app";

export default {
    Services: BGServices,
    Utils: utils,
    PluginRegistry,
    BackgroundApp,
};
