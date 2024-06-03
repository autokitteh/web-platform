import { createConnectTransport } from "@connectrpc/connect-web";
import { isAuthEnabled } from "@constants";
import { baseUrl } from "@constants/api.constants";

const credentials = isAuthEnabled ? "include" : undefined;
export const grpcTransport = createConnectTransport({
	baseUrl,
	credentials,
});
