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

import { apiRequestTimeout, descopeProjectId } from "@constants";
import { EventListenerName, LocalStorageKeys } from "@src/enums";
import { triggerEvent } from "@src/hooks";
import { useOrganizationStore } from "@src/store/useOrganizationStore";
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
			if (!(error instanceof ConnectError)) {
				throw error;
			}
			if ([Code.Unauthenticated, Code.PermissionDenied].includes(error.code)) {
				const logoutFunction = useOrganizationStore.getState().logoutFunction;
				logoutFunction(false);
			}
			if (error.code === Code.ResourceExhausted) {
				triggerEvent(EventListenerName.displayLimitReachedModal, {
					limit: 10,
					used: 5,
					resourceName: "projects",
				});
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
