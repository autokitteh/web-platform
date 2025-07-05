import React, { useState, useCallback } from "react";

import { useTranslation } from "react-i18next";

import { Button, Typography } from "@src/components/atoms";
import { salesEmail, getBillingPlanFeatures } from "@src/constants";
import { usePlanPricing, usePlanUpgrade } from "@src/hooks/billing";

import { BillingSwitcher } from "@components/molecules";

const PlanComparisonError = ({ error, onRetry }: { error: string; onRetry: () => void }) => {
	const { t } = useTranslation("billing");

	return (
		<div className="flex h-full flex-col items-center justify-center rounded-lg border border-error bg-error/10 p-6">
			<Typography className="mb-4 text-center text-error">{error}</Typography>
			<Button
				className="border-error font-semibold text-error hover:bg-error/10"
				onClick={onRetry}
				variant="outline"
			>
				{t("retryButton")}
			</Button>
		</div>
	);
};

export const PlanComparisonTable = () => {
	const { t } = useTranslation("billing");
	const billingPlanFeatures = getBillingPlanFeatures(t);
	const [selectedType, setSelectedType] = useState<string>("monthly");

	const { stripePriceId, displayPrice } = usePlanPricing(selectedType);
	const { isLoading, error, handleUpgrade, retryUpgrade, clearError, canRetry } = usePlanUpgrade();

	const handleContactSales = useCallback(() => {
		// TODO: Track contact sales click
		// analytics.track('billing_contact_sales_clicked');
		window.open(`mailto:${salesEmail}`, "_blank");
	}, []);

	const handleUpgradeClick = useCallback(() => {
		if (error) {
			clearError();
		}
		handleUpgrade(stripePriceId);
	}, [error, clearError, handleUpgrade, stripePriceId]);

	const handleRetryClick = useCallback(() => {
		retryUpgrade(stripePriceId);
	}, [retryUpgrade, stripePriceId]);

	if (error && !canRetry) {
		return <PlanComparisonError error={error} onRetry={() => handleRetryClick()} />;
	}

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
						<div className="space-y-2">
							<Button
								aria-label={t("upgradeButton")}
								className="h-7 w-full justify-center bg-green-800 py-1 text-center font-semibold text-gray-1250 hover:bg-green-500 disabled:opacity-50"
								disabled={isLoading}
								onClick={handleUpgradeClick}
								variant="filled"
							>
								{isLoading ? (
									<div className="flex items-center justify-center">
										<div className="mr-2 size-4 animate-spin rounded-full border-2 border-gray-1250 border-t-transparent" />
										<span>{t("upgrading", "Upgrading...")}</span>
									</div>
								) : (
									t("upgradeButton")
								)}
							</Button>

							{error && canRetry ? (
								<Button
									className="h-6 w-full justify-center py-1 font-semibold text-error hover:bg-error/10"
									onClick={handleRetryClick}
									variant="outline"
								>
									{t("retryButton", "Retry")}
								</Button>
							) : null}
						</div>
						<div>
							<Button
								aria-label={t("contactSalesButton")}
								className="w-full justify-center py-1 text-center font-semibold text-white hover:border-white/70 hover:bg-gray-1100"
								onClick={handleContactSales}
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
