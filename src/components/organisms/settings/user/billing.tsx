import React from "react";

import { useTranslation } from "react-i18next";

import { CancelPlanModal } from "./cancelModal";
import { ModalName } from "@src/enums";
import { useModalStore } from "@src/store";

import { Button, Typography } from "@components/atoms";
import { Table, THead, TBody, Tr, Th, Td } from "@components/atoms/table";

export const Billing = () => {
	const { t } = useTranslation("settings", { keyPrefix: "billing" });
	const { openModal } = useModalStore();

	return (
		<div className="flex flex-col gap-5 font-averta">
			<div className="flex items-center justify-between rounded-xl border border-gray-900 p-5">
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

			<div className="flex items-center justify-between rounded-xl border border-gray-900 p-5 shadow">
				<div>
					<Typography className="mb-1 font-bold">{t("payment")}</Typography>
					<Typography className="text-sm">{t("linkBy")} Stripe</Typography>
				</div>
				<Button className="mt-4 text-white md:mt-0" variant="outline">
					{t("update")}
				</Button>
			</div>

			<div className="rounded-xl border border-gray-900 p-5 shadow">
				<Typography className="mb-4 font-bold">{t("invoices")}</Typography>
				<Table>
					<THead>
						<Tr>
							<Th className="w-2/4 min-w-32 pl-4">{t("table.date")}</Th>
							<Th className="w-1/4 min-w-32">{t("table.total")}</Th>
							<Th className="w-1/4 min-w-32">{t("table.status")}</Th>
							<Th className="w-1/6">{t("table.actions")}</Th>
						</Tr>
					</THead>
					<TBody>
						<Tr>
							<Td className="w-2/4 min-w-32 pl-4">May 26, 2025</Td>
							<Td className="w-1/4 min-w-32">$20.00</Td>
							<Td className="w-1/4 min-w-32">Paid</Td>
							<Td className="ml-auto w-1/6 min-w-32">
								<Button className="text-white">{t("view")}</Button>
							</Td>
						</Tr>
						<Tr>
							<Td className="w-2/4 min-w-32 pl-4">Apr 26, 2025</Td>
							<Td className="w-1/4 min-w-32">$20.00</Td>
							<Td className="w-1/4 min-w-32">Paid</Td>
							<Td className="w-1/6 min-w-32">
								<Button className="text-white">{t("view")}</Button>
							</Td>
						</Tr>
						<Tr>
							<Td className="w-2/4 min-w-32 pl-4">Mar 26, 2025</Td>
							<Td className="w-1/4 min-w-32">$20.00</Td>
							<Td className="w-1/4 min-w-32">Paid</Td>
							<Td className="w-1/6 min-w-32">
								<Button className="text-white">{t("view")}</Button>
							</Td>
						</Tr>
					</TBody>
				</Table>
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

export default Billing;
