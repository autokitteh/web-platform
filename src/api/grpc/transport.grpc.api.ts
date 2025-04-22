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
			const response = await next(req);
			return response;
		} catch (error) {
			if (!(error instanceof ConnectError)) {
				console.log("NOT error instanceof ConnectError");
				throw error;
			}
			const rateLimitErrorType = error.metadata.get("X-Error-Type");
			const rateLimitErrorTypeLowercase = error.metadata.get("x-error-type");
			console.log("rateLimitErrorType ", rateLimitErrorType);
			console.log("rateLimitErrorTypeLowercase ", rateLimitErrorTypeLowercase);
			console.log("All metadata:", error.metadata);

			error.metadata.forEach((value, key) => {
				console.log(`Metadata key: ${key}, value: ${value}`);
			});

			const errorCode = error.code;
			const errorRawMessage = error.rawMessage;

			if (
				rateLimitErrorType === "rate_limit_exceeded" ||
				(errorCode === Code.Unavailable && errorRawMessage === "Rate limit reached")
			) {
				const rateLimit = error.metadata.get("X-Ratelimit-Limit");
				const rateLimitUsed = error.metadata.get("X-Ratelimit-Used");
				const rateLimitResource = error.metadata.get("X-Ratelimit-Resource");
				console.log("Rate limit error detected", {
					rateLimit,
					rateLimitUsed,
					rateLimitResource,
				});
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
			}
			console.log("error ", JSON.stringify(error, null, 2));
			try {
				console.log("error metadata Headers", error.metadata.Headers.get("x-Error-Type"));
				console.log("error metadata headers", error.metadata.headers.get("x-Error-Type"));
			} catch (error) {
				console.log("error ", error);
			}

			if (error.code === Code.Unavailable && error.rawMessage === "Rate limit reached") {
				console.log("CODE AND MESSAGE", error.code, error.rawMessage);

				requestBlocker.blockRequests();
				triggerEvent(EventListenerName.displayRateLimitModal);

				throw error;
			}

			if ([Code.Unauthenticated, Code.PermissionDenied].includes(error.code)) {
				LoggerService.error(
					namespaces.authorizationFlow.grpcTransport,
					t("authenticationExtended", {
						code: error.code,
						error: JSON.stringify(error, null, 2),
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
