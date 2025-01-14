import axios, { AxiosError, AxiosResponse } from "axios";
import Cookies from "js-cookie";

import { apiRequestTimeout, descopeProjectId, isLoggedInCookie, namespaces } from "@constants";
import { LocalStorageKeys } from "@src/enums";
import { getApiBaseUrl, getCookieDomain, getLocalStorageValue } from "@src/utilities";

const apiBaseUrl = getApiBaseUrl();

const createAxiosInstance = (baseAddress: string, withCredentials = false) => {
	const apiToken = getLocalStorageValue(LocalStorageKeys.apiToken);
	const isWithCredentials = !apiToken && withCredentials;
	const jwtAuthToken = apiToken ? `Bearer ${apiToken}` : undefined;

	return axios.create({
		baseURL: baseAddress,
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			"Authorization": jwtAuthToken,
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
			const { cookieDomain, error } = getCookieDomain(
				window.location.hostname,
				namespaces.authorizationFlow.axios
			);

			if (error) {
				return Promise.reject(error);
			}

			Cookies.remove(isLoggedInCookie, { domain: cookieDomain });
			window.localStorage.clear();
			window.location.reload();
		}

		return Promise.reject(error);
	}
);

// Axios instance for local domain requests (same domain as the app)
const localDomainHttpClient = createAxiosInstance("/");

export const HttpService = httpClient;
export const LocalDomainHttpService = localDomainHttpClient;
