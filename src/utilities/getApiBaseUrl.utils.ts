export const getApiBaseUrl = (): string => {
	const { hostname } = window.location;
	if (hostname === "app.autokitteh.cloud") {
		return "https://api.autokitteh.cloud";
	}
	if (hostname.endsWith(".autokitteh.cloud")) {
		const customerName = hostname.split(".")[0];
		const env = hostname.includes("dev") ? "dev." : "";

		return `https://${customerName}-api.${env}autokitteh.cloud`;
	}

	return "http://localhost:9980";
};
