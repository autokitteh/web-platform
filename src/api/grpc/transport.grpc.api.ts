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

import { apiRequestTimeout, descopeProjectId, isLoggedInCookie, namespaces } from "@constants";
import { LocalStorageKeys } from "@src/enums";
import { getApiBaseUrl, getCookieDomain, getLocalStorageValue } from "@src/utilities";

type RequestType = UnaryRequest<any, any> | StreamRequest<any, any>;
type ResponseType = UnaryResponse<any, any> | StreamResponse<any, any>;

const authInterceptor: Interceptor =
	(next) =>
	async (req: RequestType): Promise<ResponseType> => {
		try {
			const apiToken = getLocalStorageValue(LocalStorageKeys.apiToken);
			if (apiToken) {
				req.header.set("Authorization", `Bearer ${apiToken}`);
			}

			return await next(req);
		} catch (error) {
			if (error instanceof ConnectError && error.code === Code.Unauthenticated) {
				const { cookieDomain, error } = getCookieDomain(
					window.location.hostname,
					namespaces.authorizationFlow.grpcTransport
				);
				if (error) {
					throw error;
				}

				Cookies.remove(isLoggedInCookie, { domain: cookieDomain });

				window.localStorage.clear();
				window.location.reload();
			}
			throw error;
		}
	};

const credentials = descopeProjectId ? "include" : undefined;
export const grpcTransport = createConnectTransport({
	baseUrl: getApiBaseUrl(),
	credentials,
	defaultTimeoutMs: apiRequestTimeout,
	interceptors: [authInterceptor],
});
