import { useEffect } from "react";

import { useOrganizationStore } from "@src/store/useOrganizationStore";

export const useBilling = () => {
	const { billing, isLoading, getPlans, getUsage, createCheckoutSession } = useOrganizationStore();

	const { plans, usage } = billing;

	useEffect(() => {
		// Auto-fetch plans and usage when hook is first used
		if (plans.length === 0) {
			getPlans();
		}
		if (!usage) {
			getUsage();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleCheckout = async (planId: string) => {
		const response = await createCheckoutSession(planId);
		if (response.data && !response.error) {
			window.location.href = response.data;
		}
		return response;
	};

	return {
		plans,
		usage,
		loading: {
			plans: isLoading.plans,
			usage: isLoading.usage,
			checkout: isLoading.billing,
		},
		actions: {
			getPlans,
			getUsage,
			createCheckoutSession: handleCheckout,
		},
	};
};
