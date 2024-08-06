import axios, { AxiosError, AxiosResponse } from "axios";
import i18n from "i18next";
import Cookies from "js-cookie";

<<<<<<< HEAD
<<<<<<< HEAD
import { apiAuthCookieName, apiBaseUrl, apiRequestTimeout } from "@constants";
=======
import { apiBaseUrl, isLoggedInCookie } from "@constants";
>>>>>>> 62fd916b (refactor: rename constant)
import { deleteCookie } from "@src/utilities";
=======
import { apiBaseUrl, isLoggedInCookie, namespaces } from "@constants";
import { LoggerService } from "@services";
>>>>>>> bcaace5c (refactor: add cookies library instead of native js)

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
			Cookies.remove(isLoggedInCookie);

			localStorage.clear();
			LoggerService.error(namespaces.axiosHTTPClient, i18n.t("unauthenticated", { ns: "global", error }));

			window.location.reload();
		}

		return Promise.reject(error);
	}
);

// Axios instance for local domain requests (same domain as the app)
const localDomainHttpClient = createAxiosInstance("/");

export const HttpService = httpClient;
export const LocalDomainHttpService = localDomainHttpClient;
