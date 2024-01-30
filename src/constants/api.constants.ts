import { DEFAULT_PROJECT_VIEW_REFRESH_INTERVAL, DEFAULT_SIDEBAR_VIEW_REFRESH_INTERVAL } from "@constants";
import { DEFAULT_PROJECT_VIEW_SESSION_LOG_REFRESH_INTERVAL } from "@constants/extensionConfiguration.constants";
import { ValidateURL } from "@utilities";

export const baseURLFromVSCode: string = "http://localhost:9980";

export const BASE_URL = ValidateURL(baseURLFromVSCode) ? baseURLFromVSCode : "";

export const sidebarControllerRefreshRate: number = DEFAULT_SIDEBAR_VIEW_REFRESH_INTERVAL * 1000;

export const projectControllerSessionsLogRefreshRate = DEFAULT_PROJECT_VIEW_SESSION_LOG_REFRESH_INTERVAL;

export const projectControllerRefreshRate: number = DEFAULT_PROJECT_VIEW_REFRESH_INTERVAL * 1000;
