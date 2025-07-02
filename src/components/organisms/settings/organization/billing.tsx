import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { BillingService } from "@services/billing.service";
import { LoggerService } from "@services/logger.service";
import { Typography, Button, IconSvg, Spinner } from "@src/components/atoms";
import { namespaces, salesEmail } from "@src/constants";
import { useBilling } from "@src/hooks/billing/useBilling";
import { HalfCircleProgressBarProps } from "@src/interfaces/components";
import { useOrganizationStore } from "@src/store/useOrganizationStore";
import { PaymentOption } from "@src/types/billing.types";
import { cn } from "@src/utilities";

import { useToastStore } from "@store";

import { PopoverListWrapper, PopoverListTrigger, PopoverListContent } from "@components/molecules/popover";

import { GearIcon, TrashIcon } from "@assets/image/icons";

const HalfCircleProgressBar = ({ value, max }: HalfCircleProgressBarProps) => {
	const percent = Math.min(100, Math.round((value / max) * 100));
	const radius = 80;
	const stroke = 14;
	const normalizedRadius = radius - stroke / 2;
	const circumference = Math.PI * normalizedRadius;

	const firstThird = max / 3;
	const secondThird = (2 * max) / 3;

	let color = "#22c55e";
	if (value > secondThird) {
		color = "#ef4444";
	} else if (value > firstThird) {
		color = "#f59e42";
	}

	const progress = (percent / 100) * circumference;

	return (
		<div className="flex flex-col items-center justify-center">
			<svg
				className="block"
				height={radius + stroke}
				viewBox={`0 0 ${radius * 2} ${radius + stroke}`}
				width={radius * 2}
			>
				<path
					d={`M${stroke / 2},${radius} A${normalizedRadius},${normalizedRadius} 0 0,1 ${radius * 2 - stroke / 2},${radius}`}
					fill="none"
					stroke="#e5e7eb"
					strokeWidth={stroke}
				/>
				<path
					d={`M${stroke / 2},${radius} A${normalizedRadius},${normalizedRadius} 0 0,1 ${radius * 2 - stroke / 2},${radius}`}
					fill="none"
					stroke={color}
					strokeDasharray={circumference}
					strokeDashoffset={circumference - progress}
					strokeWidth={stroke}
					style={{ transition: "stroke-dashoffset 0.5s" }}
				/>
			</svg>
			<div className="mt-1 text-center">
				<span className="text-lg font-semibold text-white">
					{value} / {max}
				</span>
			</div>
		</div>
	);
};

const FeaturesTable = () => {
	const { t } = useTranslation("billing");

	const features = [
		{
			name: t("features.projects"),
			free: t("featureValues.freeProjects"),
			pro: t("featureValues.proProjects"),
			enterprise: t("featureValues.enterpriseProjects"),
		},
		{
			name: t("features.automations"),
			free: t("featureValues.freeAutomations"),
			pro: t("featureValues.proAutomations"),
			enterprise: t("featureValues.enterpriseAutomations"),
		},
		{
			name: t("features.concurrentAutomations"),
			free: t("featureValues.freeConcurrentAutomations"),
			pro: t("featureValues.proConcurrentAutomations"),
			enterprise: t("featureValues.enterpriseConcurrentAutomations"),
		},
		{
			name: t("features.dataRetention"),
			free: t("featureValues.freeDataRetention"),
			pro: t("featureValues.proDataRetention"),
			enterprise: t("featureValues.enterpriseDataRetention"),
		},
		{
			name: t("features.schedules"),
			free: t("featureValues.freeSchedules"),
			pro: t("featureValues.proSchedules"),
			enterprise: t("featureValues.enterpriseSchedules"),
		},
		{
			name: t("features.incomingEvents"),
			free: t("featureValues.freeIncomingEvents"),
			pro: t("featureValues.proIncomingEvents"),
			enterprise: t("featureValues.enterpriseIncomingEvents"),
		},
		{
			name: t("features.appIntegrations"),
			free: t("featureValues.freeAppIntegrations"),
			pro: t("featureValues.proAppIntegrations"),
			enterprise: t("featureValues.enterpriseAppIntegrations"),
		},
		{
			name: t("features.computeTime"),
			free: t("featureValues.freeComputeTime"),
			pro: t("featureValues.proComputeTime"),
			enterprise: t("featureValues.enterpriseComputeTime"),
		},
		{
			name: t("features.price"),
			free: t("featureValues.freePrice"),
			pro: t("featureValues.proPrice"),
			enterprise: t("featureValues.enterprisePrice"),
			isPrice: true,
		},
	];

	return (
		<div className="flex flex-col rounded-lg border border-gray-900 bg-gray-950 p-6 pb-3">
			<Typography className="mb-6 text-lg font-semibold" element="h2">
				{t("planComparison")}
			</Typography>

			<div className="flex flex-1 flex-col">
				<div className="mb-4 grid grid-cols-4 gap-4 border-b border-gray-800 pb-3">
					<Typography className="font-medium text-gray-400">{t("columnHeaders.feature")}</Typography>
					<div className="text-center">
						<Typography className="font-medium text-gray-400">{t("columnHeaders.free")}</Typography>
					</div>
					<div className="text-center">
						<Typography className="font-bold text-green-800">{t("columnHeaders.professional")}</Typography>
					</div>
					<div className="text-center">
						<Typography className="font-bold text-gold-500">{t("columnHeaders.enterprise")}</Typography>
					</div>
				</div>

				<div className="flex flex-1 flex-col justify-between">
					{features.map((feature, index) => (
						<div className="grid grid-cols-4 gap-4 py-3" key={index}>
							<Typography className="font-medium text-white">{feature.name}</Typography>
							<div className="text-center">
								<Typography className="text-gray-400">{feature.free}</Typography>
							</div>
							<div className="text-center">
								<Typography className="font-bold text-green-800">{feature.pro}</Typography>
							</div>
							<div className="text-center">
								{feature.isPrice ? (
									<a
										className="rounded bg-gold-500 px-3 py-2 text-sm font-bold text-black hover:bg-gold-600"
										href={`mailto:${salesEmail}`}
									>
										{feature.enterprise}
									</a>
								) : (
									<Typography className="font-bold text-gold-500">{feature.enterprise}</Typography>
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export const BillingOrganization = () => {
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
	}, [setIsLoading, getUsage]);

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
				window.location.href = data.url;
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
						<FeaturesTable />
					</div>
				) : null}

				<div className="order-2 lg:order-1 lg:w-2/5">
					<div className="flex flex-col">
						<div className="mb-6 rounded-lg border border-gray-900 bg-gray-950 p-4">
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
												{t("proBadge")}
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
								className={`rounded-lg border border-gray-900 bg-gray-950 p-6 ${isFree ? "flex-1" : "h-80"}`}
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
										<HalfCircleProgressBar max={projectsUsage.max} value={projectsUsage.used} />
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
