import { HttpService } from "@services/http.service";
import { LoggerService } from "@services/logger.service";
import { ServiceResponse } from "@src/types";

export interface PlanLimit {
	name: string;
	value: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PaymentOption {
	// Add payment option fields as needed when the structure is known
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
	planId: string;
}

export interface CheckoutSessionResponse {
	url: string;
}

export class BillingService {
	static async getPlans(): Promise<ServiceResponse<Plan[]>> {
		try {
			const response = await HttpService.get<Plan[]>("/plans");
			return { data: response.data, error: undefined };
		} catch (error) {
			LoggerService.error("Billing Service", "Failed to fetch plans", error);
			return { data: undefined, error: true };
		}
	}

	static async getUsage(): Promise<ServiceResponse<Usage>> {
		try {
			const response = await HttpService.get<Usage>("/plan/usage");
			return { data: response.data, error: undefined };
		} catch (error) {
			LoggerService.error("Billing Service", "Failed to fetch usage", error);
			return { data: undefined, error: true };
		}
	}

	static async createCheckoutSession(
		payload: CheckoutSessionRequest
	): Promise<ServiceResponse<CheckoutSessionResponse>> {
		try {
			const response = await HttpService.post<CheckoutSessionResponse>("/stripe/checkout", payload);
			return { data: response.data, error: undefined };
		} catch (error) {
			LoggerService.error("Billing Service", "Failed to create checkout session", error);
			return { data: undefined, error: true };
		}
	}
}
