import { namespaces } from "@constants/namespaces.logger.constants";
import i18n from "@i18n/index";
import { HttpJsonService } from "@services/http.service";
import { LoggerService } from "@services/logger.service";
import { ServiceResponse } from "@src/types";

export interface PlanLimit {
	name: string;
	value: number;
}

export interface PaymentOption {
	price: string;
	stripe_price_id: string;
	subscription_type: string;
}

export interface Plan {
	ID: string;
	Name: string;
	Limits: PlanLimit[];
	PaymentOptions: PaymentOption[];
}

export interface UsageItem {
	limit: string;
	used: number;
	max: number;
}

export interface Usage {
	plan: string;
	usage: UsageItem[];
}

export interface CheckoutSessionRequest {
	stripePriceId: string;
	successURL: string;
}

export interface CheckoutSessionResponse {
	redirectUrl: string;
	sessionId: string;
}

export class BillingService {
	static async getPlans(): Promise<ServiceResponse<Plan[]>> {
		try {
			const response = await HttpJsonService.get<Plan[]>("/plans");
			return { data: response.data, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.ui.billing,
				i18n.t("billing:fetchPlansFailedExtended", { error: String(error) })
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
				namespaces.ui.billing,
				i18n.t("billing.fetchUsageFailedExtended", { error: String(error) })
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
				namespaces.ui.billing,
				i18n.t("billing.failedToCreateCheckoutSession", { error: String(error) })
			);
			return { data: undefined, error: true };
		}
	}

	static async createManagementPortalSession(returnUrl: string): Promise<ServiceResponse<{ url: string }>> {
		try {
			const response = (await HttpJsonService.post<{ url: string }>("/stripe/manage", {
				returnURL: returnUrl,
			})) as unknown as { data: { url: string } };

			return { data: response.data, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.ui.billing,
				i18n.t("billing.failedToCreateManagementPortalSession", { error: String(error) })
			);
			return { data: undefined, error: true };
		}
	}
}
