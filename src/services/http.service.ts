import axios, { AxiosError, AxiosResponse } from "axios";
import Cookies from "js-cookie";

import { apiAuthCookieName, apiBaseUrl, apiRequestTimeout } from "@constants";

const createAxiosInstance = (baseAddress: string, withCredentials = false) =>
	axios.create({
		baseURL: baseAddress,
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		withCredentials,
		timeout: apiRequestTimeout,
	});

// Axios instance for API requests
const httpClient = createAxiosInstance(apiBaseUrl, import.meta.env.VITE_AUTH_ENABLED === "true");

httpClient.interceptors.response.use(
	function (response: AxiosResponse) {
		return response;
	},
	function (error: AxiosError) {
		const status = error?.response?.status || 0;
		if (status === 401) {
			Cookies.remove(apiAuthCookieName);

			localStorage.clear();
			window.location.reload();
		}

		return Promise.reject(error);
	}
);

// Axios instance for local domain requests (same domain as the app)
const localDomainHttpClient = createAxiosInstance("/");

export const HttpService = httpClient;
export const LocalDomainHttpService = localDomainHttpClient;
