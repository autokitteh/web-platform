import {
	Code,
	ConnectError,
	Interceptor,
	StreamRequest,
	StreamResponse,
	UnaryRequest,
	UnaryResponse,
} from "@connectrpc/connect";
import { createConnectTransport, createGrpcWebTransport } from "@connectrpc/connect-web";
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
			// The issue might be how you're accessing the metadata
			// Try accessing it directly from the error object
			const rateLimitErrorType = error.metadata?.get("x-error-type") || error.metadata?.get("X-Error-Type");
			console.log("rateLimitErrorType", rateLimitErrorType);

			// Try checking all available metadata to see what's there
			console.log("All metadata entries:");
			const allEntries = [];
			if (error.metadata) {
				error.metadata.forEach((value, key) => {
					allEntries.push({ key, value });
					console.log(`  ${key}: ${value}`);
				});
			}

			// Try accessing with exact casing from the server
			const rateLimit = error.metadata?.get("x-ratelimit-limit");
			const rateLimitUsed = error.metadata?.get("x-ratelimit-used");
			const rateLimitResource = error.metadata?.get("x-ratelimit-resource");

			console.log("Rate limit info:", {
				errorType: rateLimitErrorType,
				rateLimit,
				rateLimitUsed,
				rateLimitResource,
			});

			const errorCode = error.code;
			const errorRawMessage = error.rawMessage;

			// Log response headers from ConnectError metadata
			console.log("Error response headers:", Object.fromEntries(error.metadata.entries()));

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

const transport = createConnectTransport({
	baseUrl: "https://api.example.com",
});

export const grpcTransport = createGrpcWebTransport({
	baseUrl: getApiBaseUrl(),
	credentials,
	defaultTimeoutMs: apiRequestTimeout,
	interceptors: [authInterceptor],
	fetch: async (input, init) => {
		const url = input instanceof Request ? input.url : input.toString();
		const method = init?.method || (input instanceof Request ? input.method : "GET");
		const headers = init?.headers || {};
		const body = init?.body;

		try {
			// Convert Headers to a plain object that Axios can accept
			const headersObj = headers instanceof Headers ? Object.fromEntries(headers.entries()) : headers;

			const response = await axios({
				url,
				method,
				headers: headersObj,
				data: body,
				withCredentials: credentials === "include",
				responseType: "arraybuffer",
				timeout: apiRequestTimeout,
			});

			// Convert axios response to fetch Response
			return new Response(response.data, {
				status: response.status,
				statusText: response.statusText,
				headers: response.headers,
			});
		} catch (error) {
			console.log("aaaaaa", error?.config?.headers?.toJSON?.());

			if (axios.isAxiosError(error)) {
				// Handle axios errors
				if (error.response) {
					// The request was made and the server responded with a status code outside of 2xx range
					return new Response(error.response.data, {
						status: error.response.status,
						statusText: error.response.statusText,
						headers: error.response.headers,
					});
				} else if (error.request) {
					// The request was made but no response was received
					throw new TypeError("Failed to fetch");
				}
			}
			// For non-axios errors, rethrow
			throw error;
		}
	},
});
