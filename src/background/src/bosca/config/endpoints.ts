export const Endpoints = {
    // Endpoints accessible at main base URL
    AUTH_NORMAL: "/api/v1/auth/login",
    ERROR_GETTING_CODE: "/error/retrieving_code",
    MAIN_USER: "/api/v1/user",
    UPDATE_APP_CONFIG: "/api/v1/user/appConfig",
    PING: "/api/v1/user/ping",
    SEND_EMAIL: "/api/v1/email/send",
    LIST_FAQ: "/api/v1/info/faq",
    GET_ONE_TIME_CODE: "/api/v1/auth/code/grant",
    ADD_SENDER: "/api/v1/auth/sub/login",
    GET_SENDER_BY_ID: "/api/v1/sender/",
    SENDER_CONFIG: "/api/v1/sender/:id/senderConfig",
    MAIN_USER_SENDER_CONFIG: "/api/v1/user/senderConfig",
    MANAGE_SUBSCRIPTION: "/api/v1/payment/portal",
    GET_SUBSCRIPTION: "/api/v1/payment/subscribe",
    LOG_METRIC: "/api/v1/analytics/new-metric",
    LOG_BATCH: "/api/v1/analytics/new-metric-batch",
};
