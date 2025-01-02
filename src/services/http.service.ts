import axios, { AxiosError, AxiosResponse } from "axios";
import Cookies from "js-cookie";
import psl from "psl";

import { apiRequestTimeout, isLoggedInCookie } from "@constants";
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
const httpClient = createAxiosInstance(apiBaseUrl, import.meta.env.VITE_AUTH_ENABLED === "true");

httpClient.interceptors.response.use(
	function (response: AxiosResponse) {
		return response;
	},
	function (error: AxiosError) {
		const status = error?.response?.status || 0;
		if (status === 401) {
			const rootDomain = psl.parse(window.location.hostname);
			if (rootDomain.error) {
				console.error(rootDomain.error.message);

				return Promise.reject(rootDomain.error.message);
			}

			Cookies.remove(isLoggedInCookie, { domain: getCookieDomain(rootDomain) });
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
