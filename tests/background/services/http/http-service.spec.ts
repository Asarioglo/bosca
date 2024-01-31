import { ConfigService } from "../../../../src/background/services/config/config-service";
import { BGCoreServices } from "../../../../src/background/services/core-services";
import {
    HTTPService,
    HTTPResponseError,
} from "../../../../src/background/services/http/http-service";
import { ServiceRegistry } from "../../../../src/common/services/service-registry";

describe("HTTPService", () => {
    let httpService: HTTPService;
    let cfgService: ConfigService;
    let serviceRegistry: ServiceRegistry;
    let responseData = { message: "Hello, World!" };
    let mockFetch: any;
    let mockOkResponse: any;

    afterEach(() => {
        jest.restoreAllMocks();
    });

    beforeEach(() => {
        cfgService = new ConfigService();
        cfgService.set("backendHost", "https://test_host.com");
        serviceRegistry = new ServiceRegistry();
        serviceRegistry.registerService(BGCoreServices.CONFIG, cfgService);
        httpService = new HTTPService(serviceRegistry);
        mockOkResponse = {
            ok: true,
            json: jest.fn().mockResolvedValue(responseData),
        } as any;
        mockFetch = jest
            .spyOn(global, "fetch")
            .mockResolvedValue(mockOkResponse);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should fail to initialize with wrong config", () => {
        const svcRegistry = new ServiceRegistry();
        expect(() => new HTTPService(svcRegistry)).toThrow(
            "Can't initialize HTTP service. Dependency missing: ConfigService",
        );
        cfgService.set("backendHost", "test_host.com");
        svcRegistry.registerService(BGCoreServices.CONFIG, cfgService);
        expect(() => new HTTPService(svcRegistry)).toThrow(
            "Backend host in config should start with http:// or https://",
        );
    });

    it("should use header modifiers", async () => {
        const headerModifier = (headers: Headers) => {
            headers.append("X-Test-Header", "test");
        };
        httpService.addHeaderModifier(headerModifier);

        await httpService.get("/api/data");
        expect(mockFetch).toHaveBeenCalledWith(expect.any(Request));
        const req = mockFetch.mock.calls[0][0];
        expect(req).toBeInstanceOf(Request);
        expect((req as Request).headers.get("X-Test-Header")).toEqual("test");
    });

    it("should call middleware", async () => {
        const middleware = {
            beforeSend: jest.fn(),
            handleResponse: jest.fn(),
        };
        httpService.addMiddleware(middleware);

        await httpService.get("/api/data");
        expect(mockFetch).toHaveBeenCalledWith(expect.any(Request));
        expect(middleware.beforeSend).toHaveBeenCalled();
        expect(middleware.handleResponse).toHaveBeenCalled();
    });

    it("should use one time headers and header modifiers", () => {
        const oneTimeHeaders = new Headers();
        oneTimeHeaders.append("X-Test-Header-1", "test");
        const headerModifier = (headers: Headers) => {
            headers.append("X-Test-Header-2", "test2");
        };
        httpService.addHeaderModifier(headerModifier);
        const testReq = (_mockFetch: any) => {
            expect(mockFetch).toHaveBeenCalledWith(expect.any(Request));
            const req = mockFetch.mock.calls[0][0];
            expect(req).toBeInstanceOf(Request);
            expect((req as Request).headers.get("X-Test-Header-1")).toEqual(
                "test",
            );
            expect((req as Request).headers.get("X-Test-Header-2")).toEqual(
                "test2",
            );
            mockFetch.mockClear();
        };

        httpService.get("/api/data", {}, oneTimeHeaders);
        testReq(mockFetch);
        httpService.post("/api/data", {}, oneTimeHeaders);
        testReq(mockFetch);
        httpService.put("/api/data", {}, oneTimeHeaders);
        testReq(mockFetch);
    });

    it("should make a GET request and handle the response", async () => {
        const result = await httpService.get("/api/data");

        expect(mockFetch).toHaveBeenCalledWith(expect.any(Request));
        expect(mockOkResponse.json).toHaveBeenCalled();
        expect(result).toEqual(responseData);
    });

    it("should make a POST request and handle the response", async () => {
        const result = await httpService.post("/api/data", {});

        expect(mockFetch).toHaveBeenCalledWith(expect.any(Request));
        expect(mockOkResponse.json).toHaveBeenCalled();
        expect(result).toEqual(responseData);
    });

    it("should make a PUT request and handle the response", async () => {
        const result = await httpService.put("/api/data", {});

        expect(mockFetch).toHaveBeenCalledWith(expect.any(Request));
        expect(mockOkResponse.json).toHaveBeenCalled();
        expect(result).toEqual(responseData);
    });

    it("should throw an HTTPResponseError for non-OK responses", async () => {
        const mockResponse = {
            ok: false,
            statusText: "Internal Server Error",
            json: jest
                .fn()
                .mockResolvedValue({ error: "Something went wrong" }),
        } as any;
        const mockFetch = jest
            .spyOn(global, "fetch")
            .mockResolvedValue(mockResponse);

        await expect(httpService.get("/api/data")).rejects.toThrow(
            HTTPResponseError,
        );
        expect(mockFetch).toHaveBeenCalledWith(expect.any(Request));
        expect(mockResponse.json).toHaveBeenCalled();
    });
});
