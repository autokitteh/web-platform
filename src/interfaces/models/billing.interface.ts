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
	limit: "projects" | "events" | "sessions" | "ai_tokens";
	used: number;
	max: number;
}

export interface Usage {
	plan: string;
	usage: UsageItem[];
}

export interface BillingPlanFeature {
	name: string;
	free: string;
	pro: string;
	enterprise: string;
	isPrice?: boolean;
}
export interface UpgradeState {
	isLoading: boolean;
	error: string | null;
	retryCount: number;
}
