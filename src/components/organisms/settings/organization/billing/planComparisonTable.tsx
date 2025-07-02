import React from "react";

import { useTranslation } from "react-i18next";

import { Button, IconSvg, Typography } from "@src/components/atoms";
import { salesEmail, getBillingPlanFeatures, namespaces } from "@src/constants";
import { useBilling } from "@src/hooks/billing/useBilling";
import { LoggerService } from "@src/services/logger.service";
import { useOrganizationStore } from "@src/store/useOrganizationStore";
import { useToastStore } from "@src/store/useToastStore";

import { EmailIcon } from "@assets/image/icons";

interface PlanComparisonTableProps {
	selectedType?: string;
}

export const PlanComparisonTable = ({ selectedType = "monthly" }: PlanComparisonTableProps) => {
	const { t } = useTranslation("billing");
	const billingPlanFeatures = getBillingPlanFeatures(t);
	const { plans, actions } = useBilling();
	const { user, currentOrganization } = useOrganizationStore();
	const addToast = useToastStore((state) => state.addToast);

	const proOptions = plans
		.filter((plan) => plan.Name.toLowerCase() === "pro")
		.flatMap((plan) => plan.PaymentOptions)
		.sort((a) => (a.subscription_type === "yearly" ? 1 : -1));

	const handleUpgrade = async (stripePriceId: string) => {
		if (!user || !currentOrganization) {
			LoggerService.error(namespaces.ui.billing, t("userOrOrgNotFound"));
			return;
		}
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
		}
	};

	const selectedOption = proOptions.find((opt) => opt.subscription_type === selectedType);

	const stripePriceId = selectedOption?.stripe_price_id || proOptions[0]?.stripe_price_id || "";

	const getProPriceInfo = () => {
		if (selectedOption) {
			const price = selectedOption.price;
			return { price, type: selectedType };
		}
		return null;
	};

	return (
		<div className="flex h-full flex-col rounded-lg border border-gray-900 bg-gray-950 p-6 pb-3">
			<Typography className="mb-6 text-lg font-semibold" element="h2">
				{t("planComparison")}
			</Typography>

			<div className="flex flex-1 flex-col">
				<div className="mb-4 grid grid-cols-4 gap-4 border-b border-gray-800 pb-3">
					<Typography className="text-gray-400">{t("columnHeaders.feature")}</Typography>
					<div className="text-center">
						<Typography className="text-gray-400">{t("columnHeaders.free")}</Typography>
					</div>
					<div className="text-center">
						<Typography className="font-semibold text-green-800">
							{t("columnHeaders.professional")}
						</Typography>
						<div className="mt-1">
							<Typography className="text-sm font-medium text-green-600">
								${getProPriceInfo()?.price || ""}/{selectedType === "yearly" ? "yr" : "mo"}
							</Typography>
						</div>
					</div>
					<div className="text-center">
						<Typography className="text-white">{t("columnHeaders.enterprise")}</Typography>
						<div className="mt-1 flex items-center justify-center gap-1">
							<IconSvg className="fill-green-600" src={EmailIcon} />
							<a
								className="text-green-600 underline transition-colors hover:text-green-500"
								href={`mailto:${salesEmail}`}
								rel="noreferrer"
								target="_blank"
							>
								{t("featureValues.enterprisePrice")}
							</a>
						</div>
					</div>
				</div>

				<div className="flex flex-1 flex-col justify-around">
					{billingPlanFeatures.map(({ name, free, pro, enterprise }, index) => (
						<div className="grid grid-cols-4 gap-4 py-3" key={index}>
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

					<div className="grid grid-cols-4 gap-4 py-3">
						<div />
						<div />
						<div>
							<Button
								className="w-full justify-center bg-green-800 py-1 text-center font-semibold text-gray-1250 hover:bg-green-500"
								onClick={() => handleUpgrade(stripePriceId)}
								variant="filled"
							>
								{t("upgradeButton")}
							</Button>
						</div>
						<div />
					</div>
				</div>
			</div>
		</div>
	);
};
