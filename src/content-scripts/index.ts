import { BackgroundConnection } from "./connection/background-connection";

const Connection = {
    BackgroundConnection,
};

import { ContentScriptRegistry } from "./content/content-script-registry";
import { MutationManager } from "./content/mutation-manager";

const Content = {
    ContentScriptRegistry,
    MutationManager,
};

import { DefaultNotifier } from "./notifications/default-notifier";

const Notifications = {
    DefaultNotifier,
};

import { MessagingService } from "./services/messaging/messaging-service";
import { CoreServices } from "./services/core-services";

const Services = {
    MessagingService,
    CoreServices,
};

import { ContentApp } from "./content-app";

export default {
    connection: Connection,
    content: Content,
    notifications: Notifications,
    services: Services,
    ContentApp,
};
