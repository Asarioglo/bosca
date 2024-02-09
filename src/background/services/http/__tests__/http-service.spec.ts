import { ConfigService } from "../../config/config-service";
import { BGCoreServices } from "../../core-services";
import { HTTPService, HTTPResponseError } from "../http-service";
import { ServiceRegistry } from "../../../../common/services/service-registry";
import { IBrowser } from "../../../../interfaces";
import getMockBrowser from "../../../../../tests/utils/mock-runtime";
import { StorageService } from "../../storage/storage-service";
import { getBaseServiceRegistry } from "../../../../../tests/utils/base-service-registry";

describe("HTTPService", () => {
    let httpService: HTTPService;
    let cfgService: ConfigService;
    let serviceRegistry: ServiceRegistry;
    let responseData = { message: "Hello, World!" };
    let mockFetch: any;
    let mockOkResponse: any;
    let browser: IBrowser;

    afterEach(() => {
        jest.restoreAllMocks();
    });

    beforeEach(async () => {
        const [s, b] = getBaseServiceRegistry();
        browser = b;
        serviceRegistry = s;

        cfgService = new ConfigService("testId");
        await cfgService.start(browser, serviceRegistry);
        await cfgService.set("backendHost", "https://test_host.com");
        serviceRegistry.registerService(BGCoreServices.CONFIG, cfgService);

        httpService = new HTTPService();
        await httpService.start(browser, serviceRegistry);

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

    it("should fail to initialize with wrong config", async () => {
        const svcRegistry = new ServiceRegistry();
        const svc = new HTTPService();
        expect(
            async () => await svc.start(browser, svcRegistry),
        ).rejects.toThrow(
            "Can't initialize HTTP service. Dependency missing: ConfigService",
        );
        await cfgService.set("backendHost", "test_host.com");
        svcRegistry.registerService(BGCoreServices.CONFIG, cfgService);
        expect(
            async () => await svc.start(browser, svcRegistry),
        ).rejects.toThrow(
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
