import { IService } from "../../src/interfaces";

export class MockMessagingService implements IService {
    broadcastMessage = jest.fn();
    sendPopupMessage = jest.fn();
    sendContentMessage = jest.fn();
    start = jest.fn(async () => {});
    isReady = jest.fn(() => true);
}
