import {
	Code,
	ConnectError,
	Interceptor,
	StreamRequest,
	StreamResponse,
	UnaryRequest,
	UnaryResponse,
} from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import Cookies from "js-cookie";

import { apiAuthCookieName, apiBaseUrl, apiRequestTimeout, isAuthEnabled } from "@constants";

type RequestType = UnaryRequest<any, any> | StreamRequest<any, any>;
type ResponseType = UnaryResponse<any, any> | StreamResponse<any, any>;

const responseInterceptor: Interceptor =
	(next) =>
	async (req: RequestType): Promise<ResponseType> => {
		try {
			return await next(req);
		} catch (error) {
			if (error instanceof ConnectError && error.code === Code.Unauthenticated) {
				Cookies.remove(apiAuthCookieName);
				localStorage.clear();
				window.location.reload();
				throw error;
			}
			throw error;
		}
	};

const credentials = isAuthEnabled ? "include" : undefined;
export const grpcTransport = createConnectTransport({
	baseUrl: apiBaseUrl,
	credentials,
	defaultTimeoutMs: apiRequestTimeout,
	interceptors: [responseInterceptor],
});
