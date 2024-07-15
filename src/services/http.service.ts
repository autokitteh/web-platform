import axios from "axios";

import { baseUrl } from "@constants";

const httpClient = axios.create({
	baseURL: baseUrl,
	headers: {
		"Content-Type": "application/x-www-form-urlencoded",
	},
	withCredentials: import.meta.env.VITE_AUTH_ENABLED === "true",
});

export const HttpService = {
	delete: httpClient.delete,
	get: httpClient.get,
	patch: httpClient.patch,
	post: httpClient.post,
	put: httpClient.put,
};
