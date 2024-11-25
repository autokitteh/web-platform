import React from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@src/enums/components";

import { useModalStore } from "@store";

import { Button, IconSvg, Typography } from "@components/atoms";

import { PlusAccordionIcon } from "@assets/image/icons";

export const DashboardTopbar = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "topbar" });
	const { openModal } = useModalStore();

	return (
		<div className="z-10 flex flex-wrap">
			<div className="flex w-full items-end justify-between">
				<Typography className="w-full font-averta text-4xl font-semibold" element="h1">
					{t("welcome")}
				</Typography>

				<Button
					className="gap-2.5 whitespace-nowrap rounded-full border border-gray-750 py-2.5 pl-3 pr-4 font-averta text-base font-semibold"
					onClick={() => openModal(ModalName.newProject)}
					variant="filled"
				>
					<IconSvg className="fill-white" size="lg" src={PlusAccordionIcon} />

					{t("buttons.newProject")}
				</Button>
			</div>
		</div>
	);
};
