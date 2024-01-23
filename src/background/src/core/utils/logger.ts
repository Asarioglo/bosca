class Logger {
    source: string;
    enabled: boolean;
    logToConsole: boolean;

    constructor(source: string) {
        this.source = source;
        this.enabled = true;
        this.logToConsole = true;
    }

    log(message: string) {
        if (this.logToConsole && this.enabled) {
            console.log(`[${this.source}] ${message}`);
        }
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }

    setLogToConsole(logToConsole: boolean) {
        this.logToConsole = logToConsole;
    }

    static getLogger(source: string, logToConsole: boolean = true) {
        let logger = new Logger(source);
        logger.setLogToConsole(logToConsole);
        return logger;
    }
}

export default Logger;
