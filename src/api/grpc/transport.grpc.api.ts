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
import psl from "psl";

import { apiRequestTimeout, isAuthEnabled, isLoggedInCookie, jwtAuthBearerToken } from "@constants";
import { getApiBaseUrl, getCookieDomain } from "@src/utilities";

type RequestType = UnaryRequest<any, any> | StreamRequest<any, any>;
type ResponseType = UnaryResponse<any, any> | StreamResponse<any, any>;

const authInterceptor: Interceptor =
	(next) =>
	async (req: RequestType): Promise<ResponseType> => {
		try {
			if (jwtAuthBearerToken) {
				req.header.set("Authorization", `Bearer ${jwtAuthBearerToken}`);
			}

			return await next(req);
		} catch (error) {
			if (error instanceof ConnectError && error.code === Code.Unauthenticated) {
				const rootDomain = psl.parse(window.location.hostname);
				if (rootDomain.error) {
					console.error(rootDomain.error.message);

					throw rootDomain.error.message;
				}
				Cookies.remove(isLoggedInCookie, { domain: getCookieDomain(rootDomain) });

				window.localStorage.clear();
				window.location.reload();
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
