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

const TemplateIntegrationsIcon = ({
	integration,
	index,
	totalIntegrationsInTemplate,
	iconClassName,
	wrapperClassName,
}: {
	iconClassName?: string;
	index: number;
	integration: string;
	totalIntegrationsInTemplate: number;
	wrapperClassName?: string;
}) => {
	const enrichedIntegration =
		IntegrationsMap[integration as keyof typeof Integrations] ||
		HiddenIntegrationsForTemplates[integration as keyof typeof IntegrationForTemplates] ||
		{};

	const { icon, label } = enrichedIntegration;

	const iconClass = cn("z-10 rounded-full p-1", iconClassName);
	const wrapperClass = cn(
		"relative flex size-8 items-center justify-center rounded-full bg-gray-1400",
		wrapperClassName
	);

	return (
		<div className={wrapperClass} key={index} title={label}>
			<IconSvg className={iconClass} size="xl" src={icon} />
			{index < totalIntegrationsInTemplate - 1 ? (
				<PipeCircleDarkIcon className="absolute -right-4 top-1/2 -translate-y-1/2 fill-gray-500" />
			) : null}
		</div>
	);
};

export const TemplateIntegrationsIcons = ({
	template,
	className,
	iconClassName,
	wrapperClassName,
}: {
	className?: string;
	iconClassName?: string;
	template?: TemplateMetadata;
	wrapperClassName?: string;
}) => {
	if (!template) return null;

	return (
		<div className={cn("flex gap-3", className)}>
			{template.integrations.map((integration, index) => (
				<TemplateIntegrationsIcon
					iconClassName={iconClassName}
					index={index}
					integration={integration}
					key={index}
					totalIntegrationsInTemplate={template.integrations.length}
					wrapperClassName={wrapperClassName}
				/>
			))}
		</div>
	);
};
