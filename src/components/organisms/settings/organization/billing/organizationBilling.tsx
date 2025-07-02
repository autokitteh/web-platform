import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { PlanComparisonTable } from "./planComparisonTable";
import { UsageProgressBar } from "./usageProgressBar";
import { BillingService } from "@services/billing.service";
import { LoggerService } from "@services/logger.service";
import { Typography, Button, IconSvg, Spinner } from "@src/components/atoms";
import { namespaces } from "@src/constants";
import { useBilling } from "@src/hooks/billing/useBilling";
import { useOrganizationStore } from "@src/store/useOrganizationStore";
import { PaymentOption } from "@src/types/billing.types";
import { cn } from "@src/utilities";

import { useToastStore } from "@store";

import { PopoverListWrapper, PopoverListTrigger, PopoverListContent } from "@components/molecules/popover";

import { GearIcon, TrashIcon } from "@assets/image/icons";

export const OrganizationBilling = () => {
	const { t } = useTranslation("billing");
	const { plans, usage, loading, actions, setIsLoading } = useBilling();
	const { user, currentOrganization, getUsage } = useOrganizationStore();
	const addToast = useToastStore((state) => state.addToast);
	const isFree = usage?.plan === "free" || !usage;

	const [selectedType, setSelectedType] = useState<string>("monthly");
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

	const proOptions = plans
		.filter((plan) => plan.Name.toLowerCase() === "pro")
		.flatMap((plan) => plan.PaymentOptions)
		.sort((a) => (a.subscription_type === "yearly" ? 1 : -1));

	const selectedOption = proOptions.find((opt) => opt.subscription_type === selectedType);
	const planClass = (option: PaymentOption) =>
		cn("flex cursor-pointer items-center justify-between rounded border p-2 transition-colors", {
			"bg-green-900/20 border-green-500": selectedType === option.subscription_type,
			"border-gray-700 hover:border-gray-600": selectedType !== option.subscription_type,
		});

	return (
		<div className="mr-6">
			<Typography className="mb-6 font-bold" element="h1" size="2xl">
				{t("billing")}
			</Typography>

			<div className="flex flex-col lg:flex-row lg:gap-8">
				{isFree ? (
					<div className="order-1 mb-6 lg:order-2 lg:mb-0 lg:w-3/5">
						<PlanComparisonTable />
					</div>
				) : null}

				<div className="order-2 flex flex-col lg:order-1 lg:w-2/5">
					<div className="mb-6 rounded-lg border border-gray-900 bg-gray-950 p-4">
						<Typography className="mb-3 text-lg font-semibold" element="h2">
							{t("plan")}
						</Typography>

						{isFree ? (
							<div className="flex flex-col gap-6">
								<div>
									<Typography className="mb-1 font-bold text-white">{t("freePlan")}</Typography>
									<Typography className="text-sm text-gray-400">{t("upgradeToUnlock")}</Typography>
								</div>

								<div>
									<div className="mb-3 space-y-2">
										{proOptions.map((option) => (
											<label className={planClass(option)} key={option.stripe_price_id}>
												<div className="flex items-center gap-2">
													<input
														checked={selectedType === option.subscription_type}
														className="size-4 border-gray-400 text-green-500 focus:ring-green-500"
														name="planType"
														onChange={() => setSelectedType(option.subscription_type)}
														type="radio"
														value={option.subscription_type}
													/>
													<span className="text-sm font-medium">
														{option.subscription_type === "yearly"
															? t("yearlyPlan")
															: t("monthlyPlan")}
													</span>
												</div>
												<div className="flex items-center gap-2">
													{option.subscription_type === "yearly" ? (
														<span className="rounded bg-yellow-500 px-2 py-0.5 text-xs font-semibold text-black">
															{t("yearlyDiscount")}
														</span>
													) : null}
													<span className="font-bold">${option.price}</span>
												</div>
											</label>
										))}
									</div>

									<Button
										className="w-full justify-center bg-green-800 py-2 font-semibold text-black hover:bg-green-500"
										disabled={loading.checkout || !selectedOption}
										onClick={() => selectedOption && handleUpgrade(selectedOption.stripe_price_id)}
										variant="filled"
									>
										{t("upgradeToProfessional")}
									</Button>
								</div>
							</div>
						) : (
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<Typography className="text-lg font-bold text-white">
										{t("professional")}
									</Typography>

									<span className="rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 px-3 py-1 text-sm font-bold text-black">
										{t("proBadge")}
									</span>
								</div>

								<div className="flex items-center">
									{popoverLoading ? (
										<Spinner className="size-5 text-gray-500" />
									) : (
										<PopoverListWrapper
											animation="slideFromLeft"
											interactionType="click"
											placement="top-end"
										>
											<PopoverListTrigger>
												<Button className="h-7" variant="filledGray">
													{t("manage")}
												</Button>
											</PopoverListTrigger>
											<PopoverListContent
												className="z-30 flex min-w-[120px] flex-col rounded-lg border border-gray-500 bg-gray-250 p-2"
												itemClassName="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 transition hover:bg-green-200 whitespace-nowrap px-3 text-gray-1100"
												items={[
													{
														id: "delete",
														label: (
															<span className="flex items-center gap-2 font-medium text-red-500">
																<IconSvg
																	className="size-4 stroke-red-500"
																	src={TrashIcon}
																/>
																{t("delete")}
															</span>
														),
													},
													{
														id: "manage",
														label: (
															<span className="flex items-center gap-2 font-medium text-black">
																<IconSvg
																	className="size-4 stroke-black"
																	src={GearIcon}
																/>
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
							</div>
						)}
					</div>

					{projectsUsage ? (
						<div
							className={cn("rounded-lg border border-gray-900 bg-gray-950 p-6", {
								"flex-1": isFree,
								"h-80": !isFree,
							})}
						>
							<Typography className="mb-6 text-lg font-semibold" element="h2">
								{t("usage")}
							</Typography>

							<div
								className="flex flex-col items-center justify-center"
								style={{ height: isFree ? "calc(100% - 5rem)" : "200px" }}
							>
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
