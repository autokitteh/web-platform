import { namespaces } from "@constants";
import i18n from "@i18n";
import { HttpJsonService, LoggerService } from "@services";
import { Plan, Usage } from "@src/interfaces/models";
import { CheckoutSessionRequest, CheckoutSessionResponse } from "@src/interfaces/services";
import { ServiceResponse } from "@src/types";

export class BillingService {
	static async getPlans(): Promise<ServiceResponse<Plan[]>> {
		try {
			const response = await HttpJsonService.get<Plan[]>("/plans");
			return { data: response.data, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.billingService,
				i18n.t("billing.fetchPlansFailedExtended", { error: String(error), ns: "billing" })
			);
			return { data: undefined, error: true };
		}
	}

	static async getUsage(): Promise<ServiceResponse<Usage>> {
		try {
			const response = await HttpJsonService.get<Usage>("/plan/usage");
			return { data: response.data, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.billingService,
				i18n.t("fetchUsageFailedExtended", { error: String(error), ns: "billing" })
			);
			return { data: undefined, error: true };
		}
	}

	static async createCheckoutSession(
		payload: CheckoutSessionRequest
	): Promise<ServiceResponse<CheckoutSessionResponse>> {
		try {
			const response = (await HttpJsonService.post<CheckoutSessionResponse>(
				"/stripe/checkout",
				payload
			)) as unknown as {
				data: {
					redirect_url: string;
					session_id: string;
				};
			};

			const processedResponse = {
				redirectUrl: response.data.redirect_url || "",
				sessionId: response.data.session_id || "",
			};

			return { data: processedResponse, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.billingService,
				i18n.t("failedToCreateCheckoutSessionExtended", { error: String(error), ns: "billing" })
			);
			return { data: undefined, error: true };
		}
	}

	static async createManagementPortalSession(returnUrl: string): Promise<ServiceResponse<{ url: string }>> {
		try {
			const response = (await HttpJsonService.post<{ url: string }>("/stripe/manage", {
				redirect_url: returnUrl,
			})) as unknown as { data: { url: string } };

			return { data: response.data, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.billingService,
				i18n.t("failedToCreateManagementPortalSessionExtended", { error: String(error), ns: "billing" })
			);
			return { data: undefined, error: true };
		}
	}
}
