export class MockMessagingService {
    broadcastMessage = jest.fn();
    sendPopupMessage = jest.fn();
    sendContentMessage = jest.fn();
}
