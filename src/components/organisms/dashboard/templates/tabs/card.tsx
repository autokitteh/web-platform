import React from "react";

import { useTranslation } from "react-i18next";

import { TemplateMetadata } from "@src/interfaces/store";

import { Button, IconSvg, Status, Typography } from "@components/atoms";
import { TemplateIntegrationsIcons } from "@components/molecules";

import { DownloadDownArrowIcon } from "@assets/image/icons";

export const ProjectTemplateCard = ({
	category,
	onCreateClick,
	template,
}: {
	category: string;
	onCreateClick: () => void;
	template: TemplateMetadata;
}) => {
	const { t } = useTranslation("templates");

	return (
		<Button
			ariaLabel={t("createProjectFromTemplate", { template: template.title })}
			className="relative flex w-full select-none flex-col rounded-md border border-gray-1350 bg-gray-1100 px-5 pb-4 pt-5 font-averta text-white hover:bg-gray-1100"
			onClick={onCreateClick}
			variant="light"
		>
			<div className="flex w-full items-center gap-5">
				<Status>{category}</Status>

				<TemplateIntegrationsIcons className="ml-auto" template={template} />
			</div>

			<Typography className="mt-4 w-full text-left font-bold" element="h3" size="xl">
				{template.title}
			</Typography>

			<Typography className="mb-2 mt-1 self-start text-left" element="p">
				{template.description}
			</Typography>

			<div
				aria-label={t("createProjectFromTemplate", { template: template.title })}
				className="mt-auto flex w-full items-end"
				title={t("createProjectFromTemplate", { template: template.title })}
			>
				<div className="ml-auto mt-2 flex w-auto items-center gap-1.5 rounded-full border-gray-1350 bg-gray-1450 p-2 px-3.5 leading-none text-white">
					<IconSvg className="h-3" size="xl" src={DownloadDownArrowIcon} />
					{t("start")}
				</div>
			</div>
		</Button>
	);
};
