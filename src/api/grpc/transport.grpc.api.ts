import { createConnectTransport } from "@connectrpc/connect-web";
import { BASE_URL } from "@constants/api.constants";

export const grpcTransport = createConnectTransport({
	baseUrl: BASE_URL,
});
