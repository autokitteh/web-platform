import { useCallback, useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";

import { LoggerService } from "@services/logger.service";
import { billingUpgradeFetchUrlRetries, namespaces } from "@src/constants";
import { UpgradeState } from "@src/interfaces/models";
import { useToastStore } from "@src/store";
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

	const handleCheckout = async (stripePriceId: string, successUrl: string) => {
		return await createCheckoutSession(stripePriceId, successUrl);
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

export const usePlanUpgrade = () => {
	const [upgradeState, setUpgradeState] = useState<UpgradeState>({
		isLoading: false,
		error: null,
		retryCount: 0,
	});

	const { actions } = useBilling();
	const { user, currentOrganization } = useOrganizationStore();
	const addToast = useToastStore((state) => state.addToast);
	const { t } = useTranslation("billing");

	const handleUpgrade = useCallback(
		async (stripePriceId: string) => {
			if (!user || !currentOrganization) {
				const error = t("userOrOrgNotFound");
				LoggerService.error(namespaces.ui.billing, error);
				addToast({
					message: error,
					type: "error",
				});
				return;
			}

			setUpgradeState((prev) => ({
				...prev,
				isLoading: true,
				error: null,
			}));

			try {
				const { data, error } = await actions.createCheckoutSession(stripePriceId, window.location.href);

				if (data?.redirectUrl) {
					// TODO: Track successful upgrade initiation
					// analytics.track('billing_upgrade_started', { plan: 'pro' });
					window.location.href = data.redirectUrl;
					return;
				}

				if (error) {
					throw new Error(t("checkoutSessionError"));
				}
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : t("checkoutSessionError");

				LoggerService.error(namespaces.ui.billing, t("failedToCreateCheckoutSession"), error);

				setUpgradeState((prev) => ({
					...prev,
					error: errorMessage,
					retryCount: prev.retryCount + 1,
				}));

				addToast({
					message: errorMessage,
					type: "error",
				});
				// TODO: Track failed upgrade
				// analytics.track('billing_upgrade_failed', { error: errorMessage });
			} finally {
				setUpgradeState((prev) => ({
					...prev,
					isLoading: false,
				}));
			}
		},
		[user, currentOrganization, actions, addToast, t]
	);

	const retryUpgrade = useCallback(
		(stripePriceId: string) => {
			if (upgradeState.retryCount < billingUpgradeFetchUrlRetries) {
				handleUpgrade(stripePriceId);
			}
		},
		[upgradeState.retryCount, handleUpgrade]
	);

	const clearError = useCallback(() => {
		setUpgradeState((prev) => ({
			...prev,
			error: null,
		}));
	}, []);

	return {
		...upgradeState,
		handleUpgrade,
		retryUpgrade,
		clearError,
		canRetry: upgradeState.retryCount < billingUpgradeFetchUrlRetries,
	};
};

export const usePlanPricing = (selectedType: string) => {
	const { plans } = useBilling();

	return useMemo(() => {
		const proOptions = plans
			.filter((plan) => plan.Name.toLowerCase() === "pro")
			.flatMap((plan) => plan.PaymentOptions)
			.sort((a) => (a.subscription_type === "yearly" ? 1 : -1));

		const selectedOption = proOptions.find((opt) => opt.subscription_type === selectedType);
		const fallbackOption = proOptions[0];

		const stripePriceId = selectedOption?.stripe_price_id || fallbackOption?.stripe_price_id || "";
		const stripePrice = selectedOption?.price || fallbackOption?.price || "0";
		const displayPrice = Math.round(parseFloat(stripePrice));

		return {
			proOptions,
			selectedOption,
			stripePriceId,
			displayPrice,
		};
	}, [plans, selectedType]);
};
