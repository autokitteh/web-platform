export const getApiBaseUrl = (): string => {
	if (window.__env__?.VITE_HOST_URL) {
		return window.__env__.VITE_HOST_URL;
	}
	if (import.meta.env.VITE_HOST_URL) {
		return import.meta.env.VITE_HOST_URL;
	}
	const { hostname } = window.location;
	// 1. First checks cloud environments
	if (hostname === "app.autokitteh.cloud") {
		return "https://api.autokitteh.cloud";
	}
	// 2. Then checks for *.autokitteh.cloud
	if (hostname.endsWith(".autokitteh.cloud")) {
		const [env, ...rest] = hostname.split(".");
		return `https://${env}-api.${rest.join(".")}`;
	}

	// 3. Then checks for proxy path
	const proxyPath = import.meta.env.VITE_API_PROXY_PATH;
	if (proxyPath) {
		return proxyPath.startsWith("/") ? proxyPath : `/${proxyPath}`;
	}

	return "http://localhost:9980";
};
