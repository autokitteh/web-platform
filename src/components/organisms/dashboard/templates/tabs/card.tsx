import React from "react";

import { useTranslation } from "react-i18next";

import {
	HiddenIntegrationsForTemplates,
	IntegrationForTemplates,
	Integrations,
	IntegrationsMap,
} from "@src/enums/components/connection.enum";
import { TemplateMetadata } from "@src/interfaces/store";
import { cn } from "@src/utilities";

import { Button, IconSvg, Status, Typography } from "@components/atoms";

import { DownloadDownArrowIcon, PipeCircleDarkIcon } from "@assets/image/icons";

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
		<div className="relative flex select-none flex-col rounded-md border border-gray-1350 bg-gray-1100 px-5 pb-4 pt-5 font-averta text-white">
			<div className="flex w-full items-center gap-5">
				<Status>{category}</Status>

				<div className="ml-auto flex gap-3">
					{template.integrations.map((integration, index) => {
						const enrichedIntegration =
							IntegrationsMap[integration as keyof typeof Integrations] ||
							HiddenIntegrationsForTemplates[integration as keyof typeof IntegrationForTemplates] ||
							{};

						const { icon, label } = enrichedIntegration;

						return (
							<div
								className="relative flex size-8 items-center justify-center rounded-full bg-gray-1400 p-1"
								key={index}
								title={label}
							>
								<IconSvg className="z-10 rounded-full p-1" size="xl" src={icon} />
								{index < template.integrations.length - 1 ? (
									<PipeCircleDarkIcon className="absolute -right-4 top-1/2 -translate-y-1/2 fill-gray-500" />
								) : null}
							</div>
						);
					})}
				</div>
			</div>

			<Typography className="mt-4 font-bold" element="h3" size="xl">
				{template.title}
			</Typography>

			<Typography className="mb-2 mt-1" element="p">
				{template.description}
			</Typography>

			<div className={cn("mt-auto")} title={t("createProject")}>
				<Button
					ariaLabel={t("createProjectFromTemplate", { template: template.title })}
					className="ml-auto mt-2 w-auto gap-1.5 rounded-full border-gray-1350 bg-gray-1450 p-2 px-3.5 leading-none text-white"
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
