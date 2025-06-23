import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { CancelPlanModal } from "../user/cancelModal";
import { BillingService } from "@services/billing.service";
import { LoggerService } from "@services/logger.service";
import { namespaces } from "@src/constants";
import { useBilling } from "@src/hooks/billing/useBilling";
import { useOrganizationStore } from "@src/store/useOrganizationStore";
import { cn } from "@src/utilities";

import { useToastStore } from "@store";

import { Button, Typography, IconSvg, Spinner } from "@components/atoms";
import { PopoverListWrapper, PopoverListTrigger, PopoverListContent } from "@components/molecules/popover";

import { AKRoundLogo, ThreeDots } from "@assets/image";
import { GearIcon, TrashIcon } from "@assets/image/icons";

const planRadioLabelClass = (selected: boolean) =>
	cn(
		"flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition-all",
		selected
			? "border-green-800 bg-green-200 text-black"
			: "border-gray-800 bg-gray-900 text-green-500 hover:border-green-500 hover:bg-gray-800 hover:text-green-500"
	);

const HalfCircleProgressBar = ({ value, max }: { max: number; value: number }) => {
	const percent = Math.min(100, Math.round((value / max) * 100));
	const radius = 80; // Larger size
	const stroke = 14;
	const normalizedRadius = radius - stroke / 2;
	const circumference = Math.PI * normalizedRadius;

	const firstThird = max / 3;
	const secondThird = (2 * max) / 3;

	let color = "#22c55e"; // green-500
	if (value > secondThird) {
		color = "#ef4444"; // red-500
	} else if (value > firstThird) {
		color = "#f59e42"; // orange-400
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
			<span className="mt-4 text-lg font-semibold text-gray-700">
				{value} / {max}
			</span>
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

	return (
		<div className="mr-6">
			<div className="grid gap-5 pb-5 font-averta xl:grid-cols-2">
				{isFree ? (
					<div className="col-span-1 flex flex-col items-start justify-between rounded-xl border border-gray-900 bg-gray-950 p-5">
						<div>
							<Typography className="mb-1 text-lg font-bold">{t("freePlan")}</Typography>
							<Typography className="text-xs text-gray-500">{t("upgradeToUnlock")}</Typography>
						</div>
						<div className="mt-4 w-full">
							<div className="flex flex-col gap-3">
								{proOptions.map((option) => (
									<label
										aria-label={`Select ${option.subscription_type === "yearly" ? t("yearlyPlan") : t("monthlyPlan")}`}
										className={planRadioLabelClass(selectedType === option.subscription_type)}
										key={option.stripe_price_id}
									>
										<div className="flex w-full items-center">
											<input
												checked={selectedType === option.subscription_type}
												className="size-5 border-gray-300 focus:ring-green-500"
												name="planType"
												onChange={() => setSelectedType(option.subscription_type)}
												type="radio"
												value={option.subscription_type}
											/>
											<span className="ml-3 w-1/2 font-bold">
												{option.subscription_type === "yearly"
													? t("yearlyPlan")
													: t("monthlyPlan")}
											</span>
											<div className="flex w-full items-center justify-end">
												{option.subscription_type === "yearly" ? (
													<span className="mr-2 inline-block rounded bg-yellow-500 px-2 py-0.5 text-xs font-semibold text-black">
														10% OFF
													</span>
												) : null}
												<span className="text-base font-bold">${option.price}</span>
											</div>
										</div>
									</label>
								))}
							</div>
							<Button
								className="mt-4 justify-center justify-self-end bg-green-800 px-4 font-bold text-black hover:bg-green-500 hover:text-white"
								disabled={loading.checkout || !selectedOption}
								onClick={() => selectedOption && handleUpgrade(selectedOption.stripe_price_id)}
								variant="filled"
							>
								{t("upgradeToProfessional")}
							</Button>
						</div>
					</div>
				) : (
					<div className="col-span-1 flex items-center justify-between rounded-xl border border-gray-900 bg-gray-950 p-8">
						<Typography className="mb-1 text-lg font-bold capitalize text-yellow-400 drop-shadow-[0_0_8px_rgba(245,158,42,0.7)]">
							{t("professional")}
						</Typography>
						<div className="flex flex-col items-center gap-4">
							<IconSvg
								className="size-32 fill-yellow-500 drop-shadow-[0_0_8px_rgba(245,158,42,0.7)]"
								src={AKRoundLogo}
							/>
							<span className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 px-4 py-2 text-sm font-bold text-black shadow-lg ring-2 ring-yellow-800/50">
								PRO
							</span>
						</div>
						<div className="ml-4">
							{!popoverLoading ? (
								<PopoverListWrapper animation="slideFromBottom" interactionType="click">
									<PopoverListTrigger>
										<button
											className="flex items-center justify-center rounded-full p-2 hover:bg-gray-800 focus:outline-none"
											disabled={popoverLoading}
										>
											<IconSvg className="size-6 text-white" src={ThreeDots} />
										</button>
									</PopoverListTrigger>
									<PopoverListContent
										className="z-30 flex min-w-[120px] flex-col rounded-lg border-x border-gray-500 bg-gray-250 p-2"
										itemClassName="flex cursor-pointer items-center gap-2.5 rounded-3xl p-2 transition hover:bg-green-200 whitespace-nowrap px-4 text-gray-1100"
										items={[
											{
												id: "manage",
												label: (
													<span className="flex items-center gap-2 font-medium text-black">
														<IconSvg className="size-4 stroke-black" src={GearIcon} />
														{t("manage")}
													</span>
												),
											},
											{
												id: "delete",
												label: (
													<span className="flex items-center gap-2 font-medium text-red-500">
														<IconSvg className="size-4 stroke-red-500" src={TrashIcon} />
														{t("delete")}
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
							) : (
								<Spinner className="size-6" />
							)}
						</div>
					</div>
				)}
				{projectsUsage ? (
					<BillingOrganizationBlock
						label={t("projects")}
						max={projectsUsage.max}
						value={projectsUsage.used}
					/>
				) : null}
			</div>
			<CancelPlanModal />
		</div>
	);
};

const BillingOrganizationBlock = ({ label, value, max }: { label: string; max: number; value: number }) => {
	return (
		<div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-gray-900 bg-gray-950 p-5">
			<Typography className="mb-1 text-base font-bold">{label}</Typography>
			<HalfCircleProgressBar max={max} value={value} />
		</div>
	);
};
