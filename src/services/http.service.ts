import { baseUrl } from "@constants";
import axios from "axios";

const httpClient = axios.create({
	baseURL: baseUrl,
	headers: {
		"Content-Type": "application/x-www-form-urlencoded",
	},
});

export const httpService = {
	get: httpClient.get,
	post: httpClient.post,
	put: httpClient.put,
	delete: httpClient.delete,
	patch: httpClient.patch,
};
