import React from "react";

import { useTranslation } from "react-i18next";

import { cn } from "@src/utilities";
import { TemplateCardType } from "@type/components";

import { Button, IconSvg, Status, Typography } from "@components/atoms";

import { DownloadDownArrowIcon, PipeCircleDarkIcon } from "@assets/image/icons";

export const ProjectTemplateCard = ({
	card,
	category,
	onCreateClick,
}: {
	card: TemplateCardType;
	category: string;
	onCreateClick: () => void;
}) => {
	const { t } = useTranslation("templates");

	return (
		<div className="relative flex select-none flex-col rounded-md border border-gray-1350 bg-gray-1100 px-5 pb-4 pt-5 font-averta text-white">
			<div className="flex items-center gap-5">
				<Status>{category}</Status>

				<div className="flex gap-3">
					{card.integrations.map(({ icon, label }, index) => (
						<div
							className="relative flex size-8 items-center justify-center rounded-full bg-gray-1400 p-1"
							key={index}
							title={label}
						>
							<IconSvg className="z-10 rounded-full p-1" size="xl" src={icon} />

							{index < card.integrations.length - 1 ? (
								<PipeCircleDarkIcon className="absolute -right-4 top-1/2 -translate-y-1/2 fill-gray-500" />
							) : null}
						</div>
					))}
				</div>
			</div>

			<Typography className="mt-4 font-bold" element="h3" size="xl">
				{card.title}
			</Typography>

			<Typography className="mb-2 mt-1" element="p">
				{card.description}
			</Typography>

			<div className={cn("mt-auto")} title={t("createProject")}>
				<Button
					ariaLabel={t("createProjectFromTemplate", { template: card.title })}
					className="ml-auto mt-1 w-auto gap-1.5 rounded-full border-gray-1350 bg-gray-1450 p-2 px-3.5 leading-none text-white"
					onClick={onCreateClick}
					variant="filledGray"
				>
					<IconSvg className="h-3" size="xl" src={DownloadDownArrowIcon} />

					{t("start")}
				</Button>
			</div>
		</div>
	);
};
