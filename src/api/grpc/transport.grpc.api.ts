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
import i18n from "i18next";

import { apiBaseUrl, apiRequestTimeout, isAuthEnabled, isLoggedInCookie } from "@constants";
import { deleteCookie } from "@src/utilities";

type RequestType = UnaryRequest<any, any> | StreamRequest<any, any>;
type ResponseType = UnaryResponse<any, any> | StreamResponse<any, any>;

const authInterceptor: Interceptor =
	(next) =>
	async (req: RequestType): Promise<ResponseType> => {
		try {
			return await next(req);
		} catch (error) {
			if (error instanceof ConnectError && error.code === Code.Unauthenticated) {
				deleteCookie(isLoggedInCookie);
				localStorage.clear();
				console.error(i18n.t("unauthenticated", { ns: "global" }), error);
				window.location.reload();
			}
			throw error;
		}
	};

const credentials = isAuthEnabled ? "include" : undefined;
export const grpcTransport = createConnectTransport({
	baseUrl: apiBaseUrl,
	credentials,
	defaultTimeoutMs: apiRequestTimeout,
	interceptors: [authInterceptor],
});
