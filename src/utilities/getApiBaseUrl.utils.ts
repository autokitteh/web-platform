export const getApiBaseUrl = (): string => {
	const buildUrl = (url: string, useProxy: boolean): string => {
		if (url.match(/^(http|https):\/\//)) {
			return useProxy ? "/api" : url; // If proxying, return "/api"; otherwise, use the full URL
		} else {
			const path = url.startsWith("/") ? url.substring(1) : url;
			return `${window.location.origin}/${path}`;
		}
	};

	// Check runtime config first (injected via config.js)
	if (window.appConfig?.apiBaseUrl) {
		const useProxy = window.appConfig.proxy === "true" || window.appConfig.proxy === true;
		return buildUrl(window.appConfig.apiBaseUrl, useProxy);
	}

	// Fallback to Vite env var (for dev or if config.js isn’t set)
	const hostUrl = import.meta.env.VITE_HOST_URL;
	if (hostUrl) {
		return buildUrl(hostUrl, false); // Default to no proxy for Vite env
	}

	// Fallback logic based on hostname
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
