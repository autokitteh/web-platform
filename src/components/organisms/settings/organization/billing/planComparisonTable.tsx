import React, { useState } from "react";

import { useTranslation } from "react-i18next";

import { Button, Typography } from "@src/components/atoms";
import { salesEmail, getBillingPlanFeatures, namespaces } from "@src/constants";
import { useBilling } from "@src/hooks";
import { LoggerService } from "@src/services";
import { useOrganizationStore, useToastStore } from "@src/store";

import { BillingSwitcher } from "@components/molecules";

export const PlanComparisonTable = () => {
	const { t } = useTranslation("billing");
	const billingPlanFeatures = getBillingPlanFeatures(t);
	const { plans, actions } = useBilling();
	const { user, currentOrganization } = useOrganizationStore();
	const addToast = useToastStore((state) => state.addToast);
	const [selectedType, setSelectedType] = useState<string>("monthly");
	const [isUpgrading, setIsUpgrading] = useState(false);

	const proOptions = plans
		.filter((plan) => plan.Name.toLowerCase() === "pro")
		.flatMap((plan) => plan.PaymentOptions)
		.sort((a) => (a.subscription_type === "yearly" ? 1 : -1));

	const handleUpgrade = async (stripePriceId: string) => {
		if (!user || !currentOrganization) {
			LoggerService.error(namespaces.ui.billing, t("userOrOrgNotFound"));
			return;
		}

		setIsUpgrading(true);
		try {
			const { data, error } = await actions.createCheckoutSession(stripePriceId, window.location.href);

			if (data) {
				window.location.href = data.redirectUrl;
			}
			if (!data || error) {
				addToast({
					message: t("checkoutSessionError"),
					type: "error",
				});
				return;
			}
		} catch (error) {
			LoggerService.error(namespaces.ui.billing, t("failedToCreateCheckoutSession"), error);
		} finally {
			setIsUpgrading(false);
		}
	};

	const selectedOption = proOptions.find((opt) => opt.subscription_type === selectedType);

	const stripePriceId = selectedOption?.stripe_price_id || proOptions[0]?.stripe_price_id || "";
	const stripePrice = selectedOption?.price || proOptions[0]?.price || "0";
	const displayPrice = Math.round(parseFloat(stripePrice));

	return (
		<div className="flex h-full flex-col rounded-lg border border-gray-900 bg-gray-950 p-6 pb-3">
			<div className="mb-12 flex w-full items-center justify-between">
				<Typography className="text-lg font-semibold" element="h2">
					{t("planComparison")}
				</Typography>
				<BillingSwitcher onTypeChange={setSelectedType} selectedType={selectedType} />
			</div>

			<div className="flex flex-1 flex-col">
				<div className="mb-4 grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 border-b border-gray-800 pb-3">
					<Typography className="text-gray-400">{t("columnHeaders.feature")}</Typography>
					<div className="text-center">
						<Typography className="text-gray-400">{t("columnHeaders.free")}</Typography>
					</div>
					<div className="text-center">
						<Typography className="font-semibold text-green-800">
							{t("columnHeaders.professional")}
						</Typography>
						<div className="mt-1">
							<Typography className="font-medium text-green-800">
								${displayPrice}/{selectedType === "yearly" ? "yr" : "mo"}
							</Typography>
						</div>
					</div>
					<div className="text-center">
						<Typography className="text-white">{t("columnHeaders.enterprise")}</Typography>
					</div>
				</div>

				<div className="flex flex-1 flex-col justify-around">
					{billingPlanFeatures.map(({ name, free, pro, enterprise }, index) => (
						<div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 py-2" key={index}>
							<Typography className="text-white">{name}</Typography>
							<div className="text-center">
								<Typography className="text-gray-400">{free}</Typography>
							</div>
							<div className="text-center">
								<Typography className="font-semibold text-green-800">{pro}</Typography>
							</div>
							<div className="text-center">
								<Typography className="text-white">{enterprise}</Typography>
							</div>
						</div>
					))}

					<div className="mt-3 grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 py-3">
						<div />
						<div />
						<div>
							<Button
								className="w-full justify-center bg-green-800 py-1 text-center font-semibold text-gray-1250 hover:bg-green-500"
								disabled={isUpgrading}
								onClick={() => handleUpgrade(stripePriceId)}
								variant="filled"
							>
								{isUpgrading ? (
									<div className="flex items-center justify-center">
										<div className="mr-2 size-4 animate-spin rounded-full border-2 border-gray-1250 border-t-transparent" />
									</div>
								) : (
									t("upgradeButton")
								)}
							</Button>
						</div>
						<div>
							<Button
								className="w-full justify-center py-1 text-center font-semibold text-white hover:border-white/70 hover:bg-gray-1100"
								onClick={() => window.open(`mailto:${salesEmail}`, "_blank")}
								variant="outline"
							>
								{t("featureValues.enterprisePrice")}
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
