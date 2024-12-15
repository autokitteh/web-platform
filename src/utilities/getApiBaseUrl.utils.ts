export const getApiBaseUrl = (): string => {
	const { hostname } = window.location;
	if (hostname === "app.autokitteh.cloud") {
		return "https://api.autokitteh.cloud";
	}
	if (hostname.endsWith(".autokitteh.cloud")) {
		const [env, ...rest] = hostname.split(".");

		return `https://${env}-api.${rest.join(".")}`;
	}

	return "/api";
};
