import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { BillingService, PaymentOption } from "@services/billing.service";
import { LoggerService } from "@services/logger.service";
import { Typography, Button, IconSvg, Spinner } from "@src/components/atoms";
import { namespaces } from "@src/constants";
import { useBilling } from "@src/hooks/billing/useBilling";
import { useOrganizationStore } from "@src/store/useOrganizationStore";
import { cn } from "@src/utilities";

import { useToastStore } from "@store";

import { PopoverListWrapper, PopoverListTrigger, PopoverListContent } from "@components/molecules/popover";

import { GearIcon, TrashIcon } from "@assets/image/icons";

const features = [
	{ name: "Projects", free: "5", pro: "10" },
	{ name: "Automations", free: "250", pro: "5,000" },
	{ name: "Concurrent Automations", free: "5", pro: "20" },
	{ name: "Data Retention", free: "3 days", pro: "2 weeks" },
	{ name: "Schedules", free: "5", pro: "20" },
	{ name: "Incoming Events", free: "2,500", pro: "10,000" },
	{ name: "App Integrations", free: "5", pro: "10" },
	{ name: "Compute Time", free: "500 min", pro: "3,000 min" },
];

const FeaturesTable = () => {
	const { t } = useTranslation("billing");

	return (
		<div className="rounded-lg border border-gray-900 bg-gray-950 p-6 pb-0">
			<Typography className="mb-0 text-lg font-semibold" element="h2">
				{t("planComparison")}
			</Typography>

			<div className="space-y-0">
				<div className="grid grid-cols-3 gap-4 border-b border-gray-800 pb-3">
					<Typography className="font-medium text-gray-400">Feature</Typography>
					<div className="text-center">
						<Typography className="font-medium text-gray-400">Free</Typography>
					</div>
					<div className="text-center">
						<Typography className="font-medium text-green-500">Professional</Typography>
					</div>
				</div>

				{features.map((feature, index) => (
					<div className="grid grid-cols-3 gap-4 py-2" key={index}>
						<Typography className="font-medium text-white">{feature.name}</Typography>
						<div className="text-center">
							<Typography className="text-gray-400">{feature.free}</Typography>
						</div>
						<div className="text-center">
							<Typography className="text-green-500">{feature.pro}</Typography>
						</div>
					</div>
				))}
			</div>

			<div className="mt-6 border-t border-gray-800 pt-4">
				<Typography className="mb-3 text-center text-sm font-semibold text-gray-400">
					{t("upgradeToUnlockFeatures")}
				</Typography>
			</div>
		</div>
	);
};

export const BillingOrganization = () => {
	const { t } = useTranslation("billing");
	const { plans, usage, loading, actions, setIsLoading } = useBilling();
	const { user, currentOrganization, getUsage } = useOrganizationStore();
	const addToast = useToastStore((state) => state.addToast);
	const isFree = usage?.plan === "free";

	const [selectedType, setSelectedType] = useState<string>("monthly");
	const [popoverLoading, setPopoverLoading] = useState(false);

	useEffect(() => {
		setIsLoading(false, "billing");
		getUsage();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (loading.plans || loading.usage) {
		return (
			<div className="mr-6">
				<div className="flex items-center justify-center p-8">
					<Typography className="text-gray-500">{t("loadingBillingInfo")}</Typography>
				</div>
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
			if (error) {
				addToast({
					message: t("managementPortalSessionError"),
					type: "error",
				});
				setPopoverLoading(false);
				return;
			}
			if (data && data.url) {
				window.open(data.url, "_blank");
			} else {
				addToast({
					message: t("managementPortalSessionError"),
					type: "error",
				});
			}
		} catch (error) {
			LoggerService.error(namespaces.ui.billing, t("failedToCreateManagementPortalSession"), error);
		} finally {
			setPopoverLoading(false);
		}
	};

	const proOptions = plans
		.filter((plan) => plan.Name.toLowerCase() === "pro")
		.flatMap((plan) => plan.PaymentOptions)
		.sort((a) => (a.subscription_type === "yearly" ? 1 : -1)); // Show monthly first

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
						<FeaturesTable />
					</div>
				) : null}

				<div className="order-2 lg:order-1 lg:w-2/5">
					<div className="flex h-full flex-col space-y-6">
						<div className="rounded-lg border border-gray-900 bg-gray-950 p-4">
							<Typography className="mb-3 text-lg font-semibold" element="h2">
								{t("plan")}
							</Typography>

							{isFree ? (
								<div className="flex flex-col gap-6">
									<div>
										<Typography className="mb-1 font-bold text-white">{t("freePlan")}</Typography>
										<Typography className="text-sm text-gray-400">
											{t("upgradeToUnlock")}
										</Typography>
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
																10% OFF
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
											onClick={() =>
												selectedOption && handleUpgrade(selectedOption.stripe_price_id)
											}
											variant="filled"
										>
											{t("upgradeToProfessional")}
										</Button>
									</div>
								</div>
							) : (
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-4">
										<div className="flex items-center gap-3">
											<Typography className="text-lg font-bold text-white">
												{t("professional")}
											</Typography>

											<span className="rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 px-3 py-1 text-sm font-bold text-black">
												PRO
											</span>
										</div>
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
													<Button className="h-5" variant="flatText">
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
							<div className="flex-1 rounded-lg border border-gray-900 bg-gray-950 p-4">
								<Typography className="mb-4 text-lg font-semibold" element="h2">
									{t("usage")}
								</Typography>

								<div className="space-y-3">
									{/* Projects */}
									<div className="grid grid-cols-[2fr_1fr_1.5fr_0.5fr] items-center gap-4">
										<Typography className="font-medium text-white">{t("projects")}</Typography>
										<div className="flex items-center gap-2 text-sm text-gray-400">
											<span>{projectsUsage.used}</span>
											<span>/</span>
											<span>{projectsUsage.max}</span>
										</div>
										<div className="h-2 w-full rounded-full bg-gray-800">
											<div
												className="h-2 rounded-full bg-green-500 transition-all duration-300"
												style={{
													width: `${Math.min((projectsUsage.used / projectsUsage.max) * 100, 100)}%`,
												}}
											/>
										</div>
										<div className="text-right text-sm text-gray-400">
											{Math.round((projectsUsage.used / projectsUsage.max) * 100)}%
										</div>
									</div>

									{/* Automations */}
									<div className="grid grid-cols-[2fr_1fr_1.5fr_0.5fr] items-center gap-4">
										<Typography className="font-medium text-white">Automations</Typography>
										<div className="flex items-center gap-2 text-sm text-gray-400">
											<span>220</span>
											<span>/</span>
											<span>250</span>
										</div>
										<div className="h-2 w-full rounded-full bg-gray-800">
											<div
												className="h-2 rounded-full bg-red-500 transition-all duration-300"
												style={{
													width: `${Math.min((220 / 250) * 100, 100)}%`,
												}}
											/>
										</div>
										<div className="text-right text-sm text-gray-400">
											{Math.round((220 / 250) * 100)}%
										</div>
									</div>

									{/* Compute Time */}
									<div className="grid grid-cols-[2fr_1fr_1.5fr_0.5fr] items-center gap-4">
										<Typography className="font-medium text-white">Compute Time</Typography>
										<div className="flex items-center gap-2 text-sm text-gray-400">
											<span>363</span>
											<span>/</span>
											<span>500</span>
										</div>
										<div className="h-2 w-full rounded-full bg-gray-800">
											<div
												className="h-2 rounded-full bg-yellow-500 transition-all duration-300"
												style={{
													width: `${Math.min((363 / 500) * 100, 100)}%`,
												}}
											/>
										</div>
										<div className="text-right text-sm text-gray-400">
											{Math.round((363 / 500) * 100)}%
										</div>
									</div>
								</div>
							</div>
						) : null}
					</div>
				</div>
			</div>
		</div>
	);
};
