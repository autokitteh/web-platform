import axios from "axios";

import { baseUrl, hostUrl } from "@constants";

const createAxiosInstance = (baseAddress: string, withCredentials = false) =>
	axios.create({
		baseURL: baseAddress,
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		withCredentials,
	});

const httpClient = createAxiosInstance(hostUrl, import.meta.env.VITE_AUTH_ENABLED === "true");
const selfRequestsClient = createAxiosInstance(baseUrl);

export const HttpService = httpClient;
export const SelfRequestsService = selfRequestsClient;
