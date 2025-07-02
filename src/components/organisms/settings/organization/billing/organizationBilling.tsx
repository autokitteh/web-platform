import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { PlanComparisonTable } from "./planComparisonTable";
import { UsageProgressBar } from "./usageProgressBar";
import { BillingService } from "@services/billing.service";
import { LoggerService } from "@services/logger.service";
import { Typography, IconSvg, Spinner } from "@src/components/atoms";
import { namespaces } from "@src/constants";
import { useBilling } from "@src/hooks/billing/useBilling";
import { useOrganizationStore } from "@src/store/useOrganizationStore";

import { useToastStore } from "@store";

import { PopoverListWrapper, PopoverListTrigger, PopoverListContent } from "@components/molecules/popover";

import { GearIcon, ThreeDots, TrashIcon } from "@assets/image/icons";

export const OrganizationBilling = () => {
	const { t } = useTranslation("billing");
	const { usage, loading, setIsLoading } = useBilling();
	const { getUsage } = useOrganizationStore();
	const addToast = useToastStore((state) => state.addToast);
	const isFree = usage?.plan === "free" || !usage;

	const [popoverLoading, setPopoverLoading] = useState(false);

	useEffect(() => {
		setIsLoading(false, "billing");
		getUsage();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (loading.plans || loading.usage) {
		return (
			<div className="mr-6 flex items-center justify-center p-8">
				<Typography className="text-gray-500">{t("loadingBillingInfo")}</Typography>
			</div>
		);
	}

	const getUsageForLimit = (limitName: string) => {
		if (!usage) return null;
		return usage.usage.find((item) => item.limit === limitName);
	};
	const projectsUsage = getUsageForLimit("projects");

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
		<div className="mr-6">
			<div className="flex w-full justify-between">
				<Typography className="font-bold" element="h1" size="2xl">
					{t("billing")}
				</Typography>
				<div className="flex flex-row items-center justify-center gap-4">
					<Typography className="font-bold" element="h1" size="xl">
						{isFree ? t("freePlan") : t("professionalPlan")} Plan
					</Typography>

					{!isFree ? (
						<div className="flex items-center">
							{popoverLoading ? (
								<Spinner className="size-5 text-gray-500" />
							) : (
								<PopoverListWrapper
									animation="slideFromLeft"
									interactionType="click"
									placement="bottom-end"
								>
									<PopoverListTrigger>
										<IconSvg className="fill-white" size="lg" src={ThreeDots} />
									</PopoverListTrigger>
									<PopoverListContent
										className="z-30 flex min-w-[120px] flex-col rounded-lg border border-gray-500 bg-gray-250 p-2"
										itemClassName="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 transition hover:bg-green-400 whitespace-nowrap px-3 text-gray-1100"
										items={[
											{
												id: "delete",
												label: (
													<span className="flex items-center gap-2 font-medium text-red-500">
														<IconSvg className="size-4 stroke-red-500" src={TrashIcon} />
														{t("delete")}
													</span>
												),
											},
											{
												id: "manage",
												label: (
													<span className="flex items-center gap-2 font-medium text-black">
														<IconSvg className="size-4 stroke-black" src={GearIcon} />
														{t("manage")}
													</span>
												),
											},
										]}
										onItemSelect={(item) => {
											if (item.id === "manage") {
												handleManage();
											} else if (item.id === "delete") {
												handleManage();
											}
										}}
									/>
								</PopoverListWrapper>
							)}
						</div>
					) : null}
				</div>
			</div>

			<div className="flex flex-col lg:flex-row lg:gap-8">
				{isFree ? (
					<div className="order-1 mt-6 lg:order-2 lg:mb-0 lg:w-3/5">
						<PlanComparisonTable />
					</div>
				) : null}

				<div className="order-2 mt-6 flex h-full flex-col gap-6 lg:order-1 lg:w-2/5">
					{projectsUsage ? (
						<div className="flex flex-1 flex-col justify-around rounded-lg border border-gray-900 bg-gray-950 p-6">
							<Typography className="text-lg font-semibold" element="h2">
								{t("usage")}
							</Typography>

							<div className="flex flex-col items-center justify-center">
								<Typography className="mb-2 text-center font-medium text-white">
									{t("projects")}
								</Typography>
								<div className="flex flex-1 items-center justify-center">
									<UsageProgressBar max={projectsUsage.max} value={projectsUsage.used} />
								</div>
							</div>
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
};
