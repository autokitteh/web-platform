import axios, { AxiosError, AxiosResponse } from "axios";
import { t } from "i18next";

import { LoggerService } from "./logger.service";
import { apiRequestTimeout, descopeProjectId, namespaces } from "@constants";
import { EventListenerName, LocalStorageKeys } from "@src/enums";
import { triggerEvent } from "@src/hooks";
import { useOrganizationStore } from "@src/store/useOrganizationStore";
import { getApiBaseUrl, getLocalStorageValue } from "@src/utilities";
import { areRequestsBlocked, requestBlocker } from "@src/utilities/requestBlockerUtils";

const apiBaseUrl = getApiBaseUrl();

const createAxiosInstance = (baseAddress: string, withCredentials = false) => {
	const apiToken = getLocalStorageValue(LocalStorageKeys.apiToken);
	const isWithCredentials = !apiToken && withCredentials;
	const jwtAuthToken = apiToken ? `Bearer ${apiToken}` : undefined;

	return axios.create({
		baseURL: baseAddress,
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Authorization: jwtAuthToken,
		},
		withCredentials: isWithCredentials,
		timeout: apiRequestTimeout,
	});
};

// Axios instance for API requests
const httpClient = createAxiosInstance(apiBaseUrl, !!descopeProjectId);

httpClient.interceptors.request.use(
	function (config) {
		const requestsBlocked = areRequestsBlocked();
		if (requestsBlocked) {
			return Promise.reject(
				new Error(`Rate limit reached. Requests are blocked: ${AxiosError.ERR_FR_TOO_MANY_REDIRECTS}`)
			);
		}
		return config;
	},
	function (error) {
		return Promise.reject(error);
	}
);

httpClient.interceptors.response.use(
	function (response: AxiosResponse) {
		return response;
	},
	function (error: AxiosError) {
		const status = error?.response?.status || 0;
		if (status === 401) {
			const logoutFunction = useOrganizationStore.getState().logoutFunction;
			logoutFunction(false);
		}
		if (status === 429) {
			const grpcTransportError = JSON.stringify(error, null, 2);
			requestBlocker.blockRequests();

			triggerEvent(EventListenerName.displayRateLimitModal, {
				limit: 10,
				used: 10,
				resourceName: "API requests",
			});

			LoggerService.error(
				namespaces.authorizationFlow.grpcTransport,
				t("raterateLimitExtended", { ns: "authentication", error: grpcTransportError }),
				true
			);
		}

		return Promise.reject(error);
	}
);

// Axios instance for local domain requests (same domain as the app)
const localDomainHttpClient = createAxiosInstance("/");

export const HttpService = httpClient;
export const LocalDomainHttpService = localDomainHttpClient;
