/* eslint-disable no-console */
import { ValidateURL } from "@utilities/validateUrl.utils";

export const getApiBaseUrl = (): string => {
	if (window.appConfig?.rerouteApi) {
		if (window.appConfig.rerouteApi.toString()?.toLowerCase === "true") return "/api";
		else {
			console.error("Reroute API is set to false. Please set it to 'true' to reroute the API.");
		}
	}

	if (window.appConfig?.apiBaseUrl) {
		if (ValidateURL(window.appConfig.apiBaseUrl)) return window.appConfig.apiBaseUrl;
		else {
			console.error("Invalid API base URL found. Please set a valid URL in your environment variables.");
		}
	}

	const hostUrl = import.meta.env.VITE_HOST_URL;
	if (hostUrl) {
		if (ValidateURL(hostUrl)) return hostUrl;
		else {
			console.error("Invalid HOST_BASE_URL found. Please set a valid URL in your environment variables.");
			return "";
		}
	}

	const { hostname } = window.location;
	if (hostname === "app.autokitteh.cloud") {
		return "https://api.autokitteh.cloud";
	}

	if (hostname.endsWith(".autokitteh.cloud")) {
		const [env, ...rest] = hostname.split(".");
		return `https://${env}-api.${rest.join(".")}`;
	}

	return "http://localhost:9980";
};
