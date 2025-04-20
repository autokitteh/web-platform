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
import { getApiBaseUrl, getLocalStorageValue, areRequestsBlocked, requestBlocker } from "@src/utilities";

type RequestType = UnaryRequest<any, any> | StreamRequest<any, any>;
type ResponseType = UnaryResponse<any, any> | StreamResponse<any, any>;

const authInterceptor: Interceptor =
	(next) =>
	async (req: RequestType): Promise<ResponseType> => {
		if (areRequestsBlocked()) {
			throw new ConnectError("Rate limit reached. Requests are blocked.", Code.ResourceExhausted);
		}

		try {
			const apiToken = getLocalStorageValue(LocalStorageKeys.apiToken);
			if (apiToken) {
				req.header.set("Authorization", `Bearer ${apiToken}`);
			}

			return await next(req);
		} catch (error) {
			if (error instanceof TypeError && error.message === "Failed to fetch") {
				throw new ConnectError("Network error: Failed to fetch", Code.Unavailable);
			}
			if (!(error instanceof ConnectError)) {
				console.log("NOT error instanceof ConnectError");
				throw error;
			}
			const rateLimitErrorType = error.metadata.get("x-Error-Type");
			const grpcTransportError = JSON.stringify(ConnectError.from(error), null, 2);
			const errorCode = error.code;
			const errorRawMessage = error.rawMessage;
			console.log("error ", error);
			console.log("error metadata", error.metadata);

			if (
				rateLimitErrorType === "rate_limit_exceeded" ||
				(errorCode === Code.Unavailable && errorRawMessage === "Rate limit reached")
			) {
				const rateLimit = error.metadata.get("x-Ratelimit-Limit");
				const rateLimitUsed = error.metadata.get("x-Ratelimit-Used");
				const rateLimitResource = error.metadata.get("x-Ratelimit-Resource");

				if (rateLimit && rateLimitUsed && rateLimitResource) {
					requestBlocker.blockRequests();
					triggerEvent(EventListenerName.displayRateLimitModal, {
						limit: rateLimit,
						used: rateLimitUsed,
						resourceName: rateLimitResource,
					});
					LoggerService.error(
						namespaces.authorizationFlow.grpcTransport,
						t("rateLimitExtended", {
							ns: "authentication",
							error: grpcTransportError,
							limit: rateLimit,
							used: rateLimitUsed,
							resource: rateLimitResource,
						}),
						true
					);
					throw error;
				}
				LoggerService.error(
					namespaces.authorizationFlow.grpcTransport,
					t("rateLimitGeneral", {
						ns: "authentication",
						error: grpcTransportError,
					}),
					true
				);
				throw error;
			}

			triggerEvent(EventListenerName.displayRateLimitModal);
			if ([Code.Unauthenticated, Code.PermissionDenied].includes(error.code)) {
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
