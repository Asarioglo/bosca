import { EventEmitter } from "../../src/common/event-emitter";

describe("EventEmitter", () => {
    let eventEmitter: EventEmitter;

    beforeEach(() => {
        eventEmitter = new EventEmitter();
    });

    it("should add and emit listeners", () => {
        const eventType = "testEvent";
        const listener = jest.fn();

        eventEmitter.addListener(eventType, listener);
        eventEmitter.emit(eventType, "arg1", "arg2");

        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith("arg1", "arg2");

        const listener2 = jest.fn();
        eventEmitter.addListener(eventType, listener2);
        eventEmitter.emit(eventType, "arg1", "arg2");

        expect(listener2).toHaveBeenCalledTimes(1);
        expect(listener2).toHaveBeenCalledWith("arg1", "arg2");
        expect(listener).toHaveBeenCalledTimes(2);
    });

    it("should remove listeners", () => {
        const eventType = "testEvent";
        const listener1 = jest.fn();
        const listener2 = jest.fn();

        eventEmitter.addListener(eventType, listener1);
        eventEmitter.addListener(eventType, listener2);

        eventEmitter.removeListener(eventType, listener1);
        eventEmitter.emit(eventType);

        expect(listener1).not.toHaveBeenCalled();
        expect(listener2).toHaveBeenCalledTimes(1);
    });

    it("should add and remove once listeners", () => {
        const eventType = "testEvent";
        const listener = jest.fn();

        eventEmitter.once(eventType, listener);
        eventEmitter.emit(eventType);

        expect(listener).toHaveBeenCalledTimes(1);

        eventEmitter.emit(eventType);

        expect(listener).toHaveBeenCalledTimes(1);
    });
});
