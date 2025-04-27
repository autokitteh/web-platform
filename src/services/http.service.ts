import axios, { AxiosError, AxiosResponse } from "axios";

import { apiRequestTimeout, descopeProjectId } from "@constants";
import { LocalStorageKeys } from "@enums";
import { useOrganizationStore } from "@store/useOrganizationStore";
import { getApiBaseUrl, getLocalStorageValue } from "@utilities";

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

		return Promise.reject(error);
	}
);

// Axios instance for local domain requests (same domain as the app)
const localDomainHttpClient = createAxiosInstance("/");

export const HttpService = httpClient;
export const LocalDomainHttpService = localDomainHttpClient;
