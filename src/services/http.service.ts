import { baseUrl } from "@constants";
import axios from "axios";

const httpClient = axios.create({
	baseURL: baseUrl,
	headers: {
		"Content-Type": "application/x-www-form-urlencoded",
	},
	withCredentials: true,
});

export const HttpService = {
	delete: httpClient.delete,
	get: httpClient.get,
	patch: httpClient.patch,
	post: httpClient.post,
	put: httpClient.put,
};
