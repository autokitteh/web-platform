import { createConnectTransport } from "@connectrpc/connect-web";

import { apiBaseUrl, apiRequestTimeout, isAuthEnabled } from "@constants";

const credentials = isAuthEnabled ? "include" : undefined;
export const grpcTransport = createConnectTransport({
	baseUrl: apiBaseUrl,
	credentials,
	defaultTimeoutMs: apiRequestTimeout,
});
