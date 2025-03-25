import axios, { AxiosError, AxiosResponse } from "axios";

import { apiRequestTimeout, descopeProjectId } from "@constants";
import { LocalStorageKeys } from "@src/enums";
import { useOrganizationStore } from "@src/store/useOrganizationStore";
import { getApiBaseUrl, getLocalStorageValue } from "@src/utilities";

let apiBaseUrl: string | null = null; // Initialize as null

let HttpService: any;
let LocalDomainHttpService: any;

async function initializeApiBaseUrl() {
	apiBaseUrl = await getApiBaseUrl();
}

// Initialize apiBaseUrl immediately
initializeApiBaseUrl()
	.then(() => {
		// Axios instance for API requests
		const httpClient = createAxiosInstance(apiBaseUrl || "http://localhost:9980", !!descopeProjectId); // Use a default value if apiBaseUrl is still null

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

		HttpService = httpClient;
		LocalDomainHttpService = localDomainHttpClient;

		return; // Explicitly return undefined
	})
	.catch((error) => {
		// eslint-disable-next-line no-console
		console.error("Failed to initialize API base URL:", error);
		// Handle the error appropriately, e.g., display an error message to the user
	});

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

export { HttpService, LocalDomainHttpService };
