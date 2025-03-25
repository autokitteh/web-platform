import { config } from "@src/config";

export const getApiBaseUrl = (): string => {
	const buildUrl = (url: string): string => {
		if (url.match(/^(http|https):\/\//)) {
			return url;
		} else {
			const path = url.startsWith("/") ? url.substring(1) : url;
			return `${window.location.origin}/${path}`;
		}
	};

	if (config?.apiBaseUrl) {
		return buildUrl(config.apiBaseUrl);
	}

	const hostUrl = import.meta.env.VITE_HOST_URL;
	if (hostUrl) {
		return buildUrl(hostUrl);
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
