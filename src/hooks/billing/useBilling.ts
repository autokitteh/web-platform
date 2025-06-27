import { useEffect } from "react";

import { useOrganizationStore } from "@src/store/useOrganizationStore";

export const useBilling = () => {
	const { billing, isLoading, getPlans, getUsage, createCheckoutSession, setIsLoading } = useOrganizationStore();

	const { plans, usage } = billing;

	useEffect(() => {
		if (plans.length === 0) {
			getPlans();
		}
		if (!usage) {
			getUsage();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// eslint-disable-next-line @typescript-eslint/naming-convention
	const handleCheckout = async (stripePriceId: string, successURL: string) => {
		return await createCheckoutSession(stripePriceId, successURL);
	};

	return {
		plans,
		usage,
		loading: {
			plans: isLoading.plans,
			usage: isLoading.usage,
			checkout: isLoading.billing,
		},
		setIsLoading,
		actions: {
			getPlans,
			getUsage,
			createCheckoutSession: handleCheckout,
		},
	};
};
