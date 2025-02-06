import React from "react";

import {
	HiddenIntegrationsForTemplates,
	IntegrationForTemplates,
	Integrations,
	IntegrationsMap,
} from "@src/enums/components/connection.enum";
import { TemplateMetadata } from "@src/interfaces/store";
import { cn } from "@src/utilities";

import { IconSvg } from "@components/atoms";

import { PipeCircleDarkIcon } from "@assets/image/icons";

export const TemplateIntegrationsIcons = ({
	template,
	className,
}: {
	className?: string;
	template?: TemplateMetadata;
}) => {
	if (!template) return null;

	return (
		<div className={cn("flex gap-3", className)}>
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
	);
};
