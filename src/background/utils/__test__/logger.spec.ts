import Logger from "../logger";

describe("Logger", () => {
    let logger: Logger;
    let logSpy: jest.SpyInstance;
    let warnSpy: jest.SpyInstance;

    beforeEach(() => {
        logSpy = jest.spyOn(console, "log");
        warnSpy = jest.spyOn(console, "warn");
        logger = new Logger("TestSource");
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should log a message to the console", () => {
        logger.log("Test message");
        expect(logSpy).toHaveBeenCalledWith("[TestSource] Test message");
    });

    it("should warn a message to the console", () => {
        logger.warn("Test warning");
        expect(warnSpy).toHaveBeenCalledWith("[TestSource] Test warning");
    });

    it("should disable and enable logging", () => {
        logger.disable();
        logger.log("Test warning");
        expect(logSpy).not.toHaveBeenCalled();
        logger.enable();
        logger.log("Test warning");
        expect(logSpy).toHaveBeenCalledWith("[TestSource] Test warning");
        expect(logger.enabled).toBe(true);
    });

    it("should set logToConsole", () => {
        logger.setLogToConsole(false);
        logger.log("Test message");
        expect(logger.logToConsole).toBe(false);
        expect(logSpy).not.toHaveBeenCalled();
        logger.setLogToConsole(true);
        logger.log("Test message");
        expect(logger.logToConsole).toBe(true);
        expect(logSpy).toHaveBeenCalledWith("[TestSource] Test message");
    });

    it("should create a logger with default logToConsole value", () => {
        const loggerWithDefault = Logger.getLogger("TestSource");
        expect(loggerWithDefault.logToConsole).toBe(true);
    });

    it("should create a logger with custom logToConsole value", () => {
        const loggerWithCustom = Logger.getLogger("TestSource", false);
        expect(loggerWithCustom.logToConsole).toBe(false);
    });
});
