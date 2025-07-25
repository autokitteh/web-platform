import { Plan, Usage } from "../models";

export interface BillingStoreState {
	plans: Plan[];
	usage?: Usage;
}

export interface BillingLoadingState {
	billing: boolean;
	plans: boolean;
	usage: boolean;
}
