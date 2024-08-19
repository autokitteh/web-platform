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

import { apiRequestTimeout, isAuthEnabled, isLoggedInCookie } from "@constants";
import { getApiBaseUrl } from "@src/utilities";

type RequestType = UnaryRequest<any, any> | StreamRequest<any, any>;
type ResponseType = UnaryResponse<any, any> | StreamResponse<any, any>;

const authInterceptor: Interceptor =
	(next) =>
	async (req: RequestType): Promise<ResponseType> => {
		try {
			return await next(req);
		} catch (error) {
			if (error instanceof ConnectError && error.code === Code.Unauthenticated) {
				console.log("gRPC Transport - before cookie removal");
				Cookies.remove(isLoggedInCookie);
				console.log("gRPC Transport - after cookie removal");
				console.log("gRPC Transport - Descope Logging out - before localStorage.clear");
				window.localStorage.clear();
				console.log("gRPC Transport - Descope Logging out - after localStorage.clear");
				console.log("gRPC Transport - Descope Logging out - before window.location.reload");
				window.location.reload();
				console.log("gRPC Transport - Descope Logging out - after window.location.reload");
			}
			throw error;
		}
	};

const credentials = isAuthEnabled ? "include" : undefined;
export const grpcTransport = createConnectTransport({
	baseUrl: getApiBaseUrl(),
	credentials,
	defaultTimeoutMs: apiRequestTimeout,
	interceptors: [authInterceptor],
});
