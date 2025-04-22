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
import axios from "axios"; // Add axios import here
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
			const response = await next(req);
			return response;
		} catch (error) {
			if (!(error instanceof ConnectError)) {
				console.log("NOT error instanceof ConnectError");
				throw error;
			}

			// Access the original headers from the error response
			// The exact property might vary depending on your Connect version
			// Try these different approaches:

			let rateLimitErrorType, rateLimit, rateLimitUsed, rateLimitResource;

			console.log("Full error object", error);

			// Option 1: Look for a 'response' property on the error
			if (error.response) {
				console.log("Response headers:", error.response.headers);
				rateLimitErrorType = error.response.headers?.get("x-error-type");
				rateLimit = error.response.headers?.get("x-ratelimit-limit");
				rateLimitUsed = error.response.headers?.get("x-ratelimit-used");
				rateLimitResource = error.response.headers?.get("x-ratelimit-resource");
			}

			// Option 2: Look for headers in the raw transport data
			if (error.rawResponse) {
				rateLimitErrorType = error.rawResponse.headers?.get("x-error-type");
				// etc...
			}

			// Option 3: Check if there's a transport property
			if (error.transport?.headers) {
				rateLimitErrorType = error.transport.headers.get("x-error-type");
				// etc...
			}

			console.log("Rate limit headers:", {
				errorType: rateLimitErrorType,
				limit: rateLimit,
				used: rateLimitUsed,
				resource: rateLimitResource,
			});

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
