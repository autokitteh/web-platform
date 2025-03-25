export const getApiBaseUrl = async (): Promise<Promise<string>> => {
	try {
		const response = await fetch("/config/config.json");
		const config = await response.json();
		if (config.apiBaseUrl) {
			return config.apiBaseUrl;
		}
	} catch (e) {
		// eslint-disable-next-line no-console
		console.error("Failed to load runtime config:", e);
	}

	const hostUrl = import.meta.env.VITE_HOST_URL;
	if (hostUrl) {
		if (hostUrl.match(/^https?:\/\//)) {
			return hostUrl;
		} else {
			const path = hostUrl.startsWith("/") ? hostUrl.substring(1) : hostUrl;
			return `${window.location.origin}/${path}`;
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
