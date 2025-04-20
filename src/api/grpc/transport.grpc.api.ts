/* eslint-disable no-console */
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
import { t } from "i18next";

import { apiRequestTimeout, descopeProjectId, namespaces } from "@constants";
import { LoggerService } from "@services";
import { EventListenerName, LocalStorageKeys } from "@src/enums";
import { triggerEvent } from "@src/hooks";
import { useOrganizationStore } from "@src/store";
import { getApiBaseUrl, getLocalStorageValue } from "@src/utilities";

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
			console.log("error", JSON.stringify(ConnectError.from(error), null, 2));
			console.log("error.code", error.code);
			if (!(error instanceof ConnectError)) {
				throw error;
			}
			if (error.code === Code.Unavailable) {
				const grpcTransportError = JSON.stringify(ConnectError.from(error), null, 2);
				triggerEvent(EventListenerName.displayLimitReachedModal, {
					limit: 10,
					used: 5,
					resourceName: "projects",
				});
				LoggerService.error(
					namespaces.authorizationFlow.grpcTransport,
					t("rateLimitReachedExtended", { ns: "authentication", error: grpcTransportError }),
					true
				);
			}
			if ([Code.Unauthenticated, Code.PermissionDenied].includes(error.code)) {
				const grpcTransportError = JSON.stringify(ConnectError.from(error), null, 2);
				LoggerService.error(
					namespaces.authorizationFlow.grpcTransport,
					t("authenticationExtended", {
						code: error.code,
						error: grpcTransportError,
						ns: "authentication",
					}),
					true
				);
				const logoutFunction = useOrganizationStore.getState().logoutFunction;
				logoutFunction(false);
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
