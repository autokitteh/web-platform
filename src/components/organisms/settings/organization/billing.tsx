import React from "react";

import { useTranslation } from "react-i18next";

import { CancelPlanModal } from "../user/cancelModal";
import { ModalName } from "@src/enums";
import { useModalStore } from "@src/store";

import { Button, Typography, Tooltip } from "@components/atoms";

export const BillingOrganization = () => {
	const { t } = useTranslation("settings", { keyPrefix: "billing" });
	const { openModal } = useModalStore();

	return (
		<div className="grid gap-5 pb-5 pr-9 font-averta xl:grid-cols-2">
			<div className="col-span-1 flex items-center justify-between rounded-xl border border-gray-900 p-5">
				<div>
					<Typography className="mb-1 text-lg font-bold">{t("proPlan")}</Typography>
					<Typography className="mb-1 text-sm font-medium">{t("monthly")}</Typography>
					<Typography className="text-xs text-gray-500">
						{t("autoSubscriptionRenew")} Jun 26, 2025.
					</Typography>
				</div>
				<Button className="mt-4 text-white md:mt-0" variant="outline">
					{t("adjustPlan")}
				</Button>
			</div>

			<BillingOrganizationBlock label="Projects" max={10000} value={4710} />

			<div className="flex items-center justify-between rounded-xl border border-gray-900 p-5 shadow">
				<div>
					<Typography className="mb-1 font-bold">{t("payment")}</Typography>
					<Typography className="text-sm">{t("linkBy")} Stripe</Typography>
				</div>
				<Button className="mt-4 text-white md:mt-0" variant="outline">
					{t("update")}
				</Button>
			</div>

			<div className="flex items-center justify-between rounded-xl border border-gray-900 p-5">
				<div>
					<Typography className="font-bold">{t("cancelation")}</Typography>
					<Typography className="mt-2.5 text-sm">{t("cancelPlan")}</Typography>
				</div>
				<Button className="mt-auto text-white" onClick={() => openModal(ModalName.cancelPlan)} variant="filled">
					{t("cancel")}
				</Button>
			</div>

			<CancelPlanModal />
		</div>
	);
};

const BillingOrganizationBlock = ({ label, value, max }: { label: string; max: number; value: number }) => {
	const formatShort = (num: number): string => {
		if (num < 1000) return num.toString();
		if (num % 1000 === 0) return `${num / 1000}K`;
		if (num % 100 === 0) return `${(num / 1000).toFixed(1)}K`;
		return `${(num / 1000).toFixed(1)}K*`;
	};
	const shortValue = formatShort(value);
	const shortMax = formatShort(max);
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
