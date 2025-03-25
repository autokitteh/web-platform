export const getApiBaseUrl = (): string => {
	const { hostname } = window.location;
	// For cloud environments
	if (hostname === "app.autokitteh.cloud") {
		return "https://api.autokitteh.cloud";
	}
	if (hostname.endsWith(".autokitteh.cloud")) {
		const [env, ...rest] = hostname.split(".");
		return `https://${env}-api.${rest.join(".")}`;
	}

	// Check for a configured proxy path
	const proxyPath = import.meta.env.VITE_API_PROXY_PATH;
	if (proxyPath) {
		// Return a relative path that will be handled by nginx proxy
		return proxyPath.startsWith("/") ? proxyPath : `/${proxyPath}`;
	}

	// Fall back to the standard host URL
	return import.meta.env.VITE_HOST_URL || "http://localhost:9980";
};
