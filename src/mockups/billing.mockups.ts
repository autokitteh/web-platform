import { Usage } from "@src/interfaces/models";

export const defaultUsage: Usage = { plan: "free", usage: [] };

export const disabledBillingResponse = {
	plans: [],
	usage: undefined,
	plansError: false,
	usageError: false,
	loading: {
		plans: false,
		usage: false,
		checkout: false,
	},
	setIsLoading: () => {},
	actions: {
		reloadBilling: () => {},
		createCheckoutSession: async () => ({ data: undefined, error: true }),
	},
};

export const disabledPlanUpgradeResponse = {
	isLoading: false,
	error: null,
	retryCount: 0,
	handleUpgrade: async () => {},
	retryUpgrade: () => {},
	clearError: () => {},
	canRetry: false,
};

export const disabledPlanPricingResponse = {
	proOptions: [],
	selectedOption: undefined,
	stripePriceId: "",
	displayPrice: 0,
};
