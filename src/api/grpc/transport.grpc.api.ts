import { createConnectTransport } from "@connectrpc/connect-web";
import { baseUrl } from "@constants/api.constants";

export const grpcTransport = createConnectTransport({
	baseUrl: baseUrl,
	credentials: "include",
});
