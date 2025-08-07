import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { BillingService } from "@services/billing.service";
import { LoggerService } from "@services/logger.service";
import { Typography } from "@src/components/atoms";
import { namespaces } from "@src/constants";
import { useBilling } from "@src/hooks/billing/useBilling";

import { useToastStore } from "@store";

import { UsageProgressBar, PlanComparisonTable } from "@components/molecules";
import { OrganizationManagePlanMenu } from "@components/molecules/organizationManagePlanMenu";

export const OrganizationBilling = () => {
	const { t } = useTranslation("billing");
	const { usage, loading, plansError, usageError, actions, setIsLoading } = useBilling();
	const addToast = useToastStore((state) => state.addToast);
	const isFree = usage?.plan === "free" || !usage;

	const [popoverLoading, setPopoverLoading] = useState(false);

	const reload = async () => {
		setIsLoading(true, "billing");
		actions.reloadBilling();
		setIsLoading(false, "billing");
	};

	useEffect(() => {
		reload();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (plansError || usageError) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-center">
					<Typography className="mb-4 text-red-500">{t("fetchUsageFailedExtended")}</Typography>
					<button className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700" onClick={reload}>
						{t("retryButton")}
					</button>
				</div>
			</div>
		);
	}

	if (loading.plans || loading.usage) {
		return (
			<div className="flex items-center justify-center p-8">
				<Typography className="text-gray-500">{t("loadingBillingInfo")}</Typography>
			</div>
		);
	}

	const getUsageForLimit = (limitName: string) => {
		if (!usage) return null;
		return usage.usage.find((item) => item.limit === limitName);
	};
	const usageItems = [
		{ key: "projects", usage: getUsageForLimit("projects") },
		{ key: "events", usage: getUsageForLimit("events") },
		{ key: "sessions", usage: getUsageForLimit("sessions") },
	].filter((item) => item.usage);

	const handleManage = async () => {
		setPopoverLoading(true);
		try {
			const { data, error } = await BillingService.createManagementPortalSession(window.location.href);
			if (error || !data) {
				addToast({
					message: t("managementPortalSessionError"),
					type: "error",
				});
				return;
			}
			window.location.href = data.url;
		} catch (error) {
			LoggerService.error(namespaces.ui.billing, t("failedToCreateManagementPortalSession"), error);
		} finally {
			setPopoverLoading(false);
		}
	};

	return (
		<>
			<div className="flex w-full justify-between">
				<Typography className="font-bold" element="h1" size="2xl">
					{t("billing")}
				</Typography>
				<div className="flex flex-row items-center justify-center gap-4">
					<Typography className="font-bold" element="h1" size="xl">
						{isFree ? t("freePlan") : t("professionalPlan")}
					</Typography>

					{!isFree ? <OrganizationManagePlanMenu loading={popoverLoading} onManage={handleManage} /> : null}
				</div>
			</div>

			<div className="mt-4 flex h-full min-h-0 flex-row space-x-4 pb-6" id="usage-and-plan-comparison">
				<div className="flex w-1/5 flex-col">
					{usageItems?.length ? (
						<div className="flex flex-1 flex-col items-center rounded-lg border border-gray-900 bg-gray-950 p-2">
							<Typography className="mt-4 text-lg font-semibold" element="h2">
								{t("usage")}
							</Typography>

							<div className="mt-6 flex h-full flex-1 flex-col gap-y-8 2xl:gap-y-14 3xl:gap-y-[4.15rem]">
								{usageItems.map(
									(item) =>
										item?.usage && (
											<div className="flex flex-col items-center justify-center" key={item.key}>
												<Typography className="text-base text-gray-400">
													{t(item.key)}
												</Typography>
												<div className="flex flex-1 items-center justify-center">
													<UsageProgressBar
														max={item.usage?.max ?? 0}
														value={item.usage?.used ?? 0}
													/>
												</div>
											</div>
										)
								)}
							</div>
						</div>
					) : (
						<div className="rounded-md border border-red-500 bg-red-500/15 p-2 text-center text-white">
							Usage data not found
						</div>
					)}
				</div>
				{isFree ? (
					<div className="w-4/5">
						<PlanComparisonTable />
					</div>
				) : null}
			</div>
		</>
	);
};
