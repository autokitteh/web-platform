import React from "react";

import {
	HiddenIntegrationsForTemplates,
	IntegrationForTemplates,
	Integrations,
	IntegrationsMap,
} from "@enums/components/connection.enum";
import { TemplateMetadata } from "@interfaces/store";
import { cn } from "@utilities";

import { IconSvg } from "@components/atoms";

import { PipeCircleDarkIcon } from "@assets/image/icons";

const ConnectorIcon = ({ show }: { show: boolean }) => {
	if (!show) return null;

	return <PipeCircleDarkIcon className="absolute -right-4 top-1/2 -translate-y-1/2 fill-white" />;
};

const TemplateIntegrationsIcon = ({
	integration,
	index,
	totalIntegrationsInTemplate,
	iconClassName,
	wrapperClassName,
	size,
}: {
	iconClassName?: string;
	index: number;
	integration: string;
	size?: "2xl" | "xl";
	totalIntegrationsInTemplate: number;
	wrapperClassName?: string;
}) => {
	const enrichedIntegration =
		IntegrationsMap[integration as keyof typeof Integrations] ||
		HiddenIntegrationsForTemplates[integration as keyof typeof IntegrationForTemplates] ||
		{};

	const { icon, label } = enrichedIntegration;

	const iconClass = cn("z-10 rounded-full p-0.5", iconClassName);
	const wrapperClass = cn(
		"relative flex size-8 items-center justify-center rounded-full bg-gray-1400",
		{ "size-10": size === "2xl" },
		wrapperClassName
	);

	return (
		<div className={wrapperClass} key={index} title={label}>
			<IconSvg className={iconClass} size={size} src={icon} />
			<ConnectorIcon show={index < totalIntegrationsInTemplate - 1} />
		</div>
	);
};

export const TemplateIntegrationsIcons = ({
	template,
	className,
	iconClassName,
	wrapperClassName,
	size = "xl",
}: {
	className?: string;
	iconClassName?: string;
	size?: "2xl" | "xl";
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
					size={size}
					totalIntegrationsInTemplate={template.integrations.length}
					wrapperClassName={wrapperClassName}
				/>
			))}
		</div>
	);
};
