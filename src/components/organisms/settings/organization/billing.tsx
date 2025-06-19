import React from "react";

import { useTranslation } from "react-i18next";

import { CancelPlanModal } from "../user/cancelModal";
import { useBilling } from "@src/hooks/billing/useBilling";
import { formatCompactNumber } from "@src/utilities";

import { Button, Typography, Tooltip } from "@components/atoms";

export const BillingOrganization = () => {
	const { t } = useTranslation("settings", { keyPrefix: "billing" });
	const { plans, usage, loading, actions } = useBilling();
	const currentPlan = plans.find((plan) => plan.Name.toLowerCase() === "professional") || null;
	const isFree = !currentPlan;

	if (loading.plans || loading.usage) {
		return (
			<div className="mr-6">
				<div className="flex items-center justify-center p-8">
					<Typography className="text-gray-500">Loading billing information...</Typography>
				</div>
			</div>
		);
	}

	const getUsageForLimit = (limitName: string) => {
		if (!usage) return null;
		return usage.usage.find((item) => item.limit === limitName);
	};

	const projectsUsage = getUsageForLimit("projects");

	return (
		<div className="mr-6">
			<div className="grid gap-5 pb-5 font-averta xl:grid-cols-2">
				{isFree ? (
					<>
						<div className="col-span-1 flex items-center justify-between rounded-xl border border-gray-900 p-5">
							<div>
								<Typography className="mb-1 text-lg font-bold">Free</Typography>
								<Typography className="mb-1 text-sm font-medium">{t("monthly")}</Typography>
								<Typography className="text-xs text-gray-500">
									Upgrade to unlock more features
								</Typography>
							</div>
							<Button
								className="mt-4 bg-green-800 px-4 font-bold text-black md:mt-0"
								disabled={loading.checkout}
								onClick={() => {
									const professionalPlan = plans.find((p) =>
										p.Name.toLowerCase().includes("professional")
									);
									if (professionalPlan) {
										actions.createCheckoutSession(professionalPlan.ID);
									}
								}}
								variant="filled"
							>
								{loading.checkout ? "Processing..." : "Upgrade"}
							</Button>
						</div>

						{projectsUsage ? (
							<BillingOrganizationBlock
								label="Projects"
								max={projectsUsage.max}
								value={projectsUsage.used}
							/>
						) : null}
					</>
				) : (
					<>
						<div className="col-span-1 flex items-center justify-between rounded-xl border border-gray-900 p-5">
							<div>
								<Typography className="mb-1 text-lg font-bold">
									{currentPlan?.Name || "Professional"}
								</Typography>
								{/* <Typography className="mb-1 text-sm font-medium">{t("monthly")}</Typography>
								<Typography className="text-xs text-gray-500">
									{t("autoSubscriptionRenew")} Jun 26, 2025.
								</Typography> */}
							</div>
						</div>

						{projectsUsage ? (
							<BillingOrganizationBlock
								label="Projects"
								max={projectsUsage.max}
								value={projectsUsage.used}
							/>
						) : null}
					</>
				)}
			</div>
			<CancelPlanModal />
		</div>
	);
};

const BillingOrganizationBlock = ({ label, value, max }: { label: string; max: number; value: number }) => {
	const shortValue = formatCompactNumber(value);
	const shortMax = formatCompactNumber(max);
	const display = `${shortValue}/${shortMax}`;

	return (
		<div className="flex flex-1 flex-col justify-center rounded-xl border border-gray-900 p-5">
			<Typography className="mb-1 text-base font-bold">{label}</Typography>
			<Tooltip content={`Exact: ${value}/${max}`} position="bottom-start">
				<span className="text-xl font-bold">{display}</span>
			</Tooltip>
		</div>
	);
};
