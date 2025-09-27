import {
	Interceptor,
	StreamRequest,
	StreamResponse,
	UnaryRequest,
	UnaryResponse,
	Code,
	ConnectError,
} from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { t } from "i18next";

import { apiRequestTimeout, descopeProjectId, namespaces } from "@constants";
import { LoggerService } from "@services/logger.service";
import { EventListenerName, LocalStorageKeys } from "@src/enums";
import { triggerEvent } from "@src/hooks";
import { useOrganizationStore } from "@src/store";
import { getApiBaseUrl, getEncryptedLocalStorageValue } from "@src/utilities";

type RequestType = UnaryRequest<any, any> | StreamRequest<any, any>;
type ResponseType = UnaryResponse<any, any> | StreamResponse<any, any>;

const handleRateLimitError = (error: ConnectError) => {
	triggerEvent(EventListenerName.displayRateLimitModal);
	LoggerService.error(
		namespaces.authorizationFlow.grpcTransport,
		t("errors.rateLimitExtended", {
			ns: "authentication",
			error: `${error.code}: ${error.rawMessage}`,
		}),
		true
	);
};

const authInterceptor: Interceptor =
	(next) =>
	async (req: RequestType): Promise<ResponseType> => {
		try {
			const apiToken = await getEncryptedLocalStorageValue(LocalStorageKeys.apiToken);
			if (apiToken) {
				req.header.set("Authorization", `Bearer ${apiToken}`);
			}

			return await next(req);
		} catch (error) {
			if (!(error instanceof ConnectError)) {
				throw error;
			}

			if ([Code.Unauthenticated, Code.PermissionDenied].includes(error.code)) {
				LoggerService.error(
					namespaces.authorizationFlow.grpcTransport,
					t("erros.authenticationExtended", {
						code: error.code,
						error: JSON.stringify(error, null, 2),
						ns: "authentication",
					}),
					true
				);
				const logoutFunction = useOrganizationStore.getState().logoutFunction;
				logoutFunction(false);
			}

			const responseErrorType = error?.metadata?.get("x-error-type");

			if (error.code === Code.ResourceExhausted && !responseErrorType) handleRateLimitError(error);

			switch (responseErrorType) {
				case "rate_limit_exceeded":
					handleRateLimitError(error);
					throw error;
				case "quota_limit_exceeded": {
					const quotaLimit = error?.metadata?.get("x-quota-limit") || "";
					const quotaLimitUsed = error?.metadata?.get("x-quota-used") || "";
					const quotaLimitResource = error?.metadata?.get("x-quota-resource") || "";

					triggerEvent(EventListenerName.displayQuotaLimitModal, {
						limit: quotaLimit,
						used: quotaLimitUsed,
						resourceName: quotaLimitResource,
					});

					LoggerService.error(
						namespaces.authorizationFlow.grpcTransport,
						t("errors.quotaLimitExtended", {
							ns: "authentication",
							error: `${error.code}: ${error.rawMessage}`,
							limit: quotaLimit,
							used: quotaLimitUsed,
							resourceName: quotaLimitResource,
						}),
						true
					);
					throw error;
				}
				default:
					throw error;
			}
		}
	};

const credentials = descopeProjectId ? "include" : undefined;

export const grpcTransport = createConnectTransport({
	baseUrl: getApiBaseUrl(),
	credentials,
	defaultTimeoutMs: apiRequestTimeout,
	interceptors: [authInterceptor],
});
