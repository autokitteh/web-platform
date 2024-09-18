import React from "react";

import { useTranslation } from "react-i18next";

import { DashboardFooterTemplateCardType } from "@src/types/components";

import { Button, IconSvg, Loader, Typography } from "@components/atoms";

import { DownloadDownArrowIcon } from "@assets/image/icons";

export const DashboardFooterProjectCard = ({
	card,
	isCreating,
	onCreateClick,
}: {
	card: DashboardFooterTemplateCardType;
	isCreating: boolean;
	onCreateClick: () => void;
}) => {
	const { t } = useTranslation("dashboard", { keyPrefix: "projects" });

	return (
		<div className="rounded-md border-2 border-gray-1050 bg-gray-1100 px-5 pb-4 pt-6 font-averta">
			<div className="flex items-center gap-4">
				<div className="flex h-10 w-10 items-center justify-center rounded-full bg-white p-1">
					<IconSvg className="rounded-full" size="xl" src={card.icon} />
				</div>

				<Typography className="font-bold" element="h3" size="large">
					{card.title}
				</Typography>
			</div>

			<Typography className="mb-1 ml-14 mt-2" element="p">
				{card.description}
			</Typography>

			<Button
				className="border-1 ml-auto mt-auto w-auto gap-1.5 rounded-full border-gray-1350 bg-gray-1450 p-2 px-3.5 leading-none text-white"
				onClick={onCreateClick}
				title={t("createProject")}
				variant="filledGray"
			>
				{isCreating ? (
					<div className="flex h-3 w-4 items-center">
						<Loader size="sm" />
					</div>
				) : (
					<IconSvg className="h-3" size="xl" src={DownloadDownArrowIcon} />
				)}

				{t("buttons.start")}
			</Button>
		</div>
	);
};
