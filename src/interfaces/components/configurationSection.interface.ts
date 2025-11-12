import React from "react";

import { FrontendProjectValidationProps } from ".";
import { Integrations } from "@src/enums/components";
import { ProjectValidationLevel } from "@src/types";

export interface VariableItem {
	id: string;
	name: string;
	varValue?: string;
	isSecret?: boolean;
}

export interface ConnectionItem {
	id: string;
	name: string;
	errorMessage?: string;
	icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	integration: (typeof Integrations)[keyof typeof Integrations];
}

export interface TriggerItem {
	id: string;
	name: string;
	entrypoint?: string;
	webhookSlug?: string;
}

export type ProjectSettingsItemAction = {
	configure: {
		ariaLabel?: string;
		icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
		label: string;
		onClick: (itemId: string) => void;
	};
	delete: {
		ariaLabel?: string;
		icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
		label: string;
		onClick: (itemId: string) => void;
	};
	showEvents?: {
		ariaLabel?: string;
		icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
		label: string;
		onClick: (itemId: string) => void;
	};
};

interface BaseConfigurationSectionListProps {
	accordionKey: string;
	title: string;
	actions: ProjectSettingsItemAction;
	onAdd: () => void;
	addButtonLabel?: string;
	emptyStateMessage?: string;
	validation?: {
		level?: ProjectValidationLevel;
		message?: string;
	};
	className?: string;
	isOpen?: boolean;
	id?: string;
	onToggle?: (isOpen: boolean) => void;
	isLoading?: boolean;
}

export interface VariablesSectionListProps extends BaseConfigurationSectionListProps {
	items: VariableItem[];
	frontendValidationStatus?: FrontendProjectValidationProps;
}

export interface ConnectionsSectionListProps extends BaseConfigurationSectionListProps {
	items: ConnectionItem[];
	frontendValidationStatus?: FrontendProjectValidationProps;
}

export interface TriggersSectionListProps extends BaseConfigurationSectionListProps {
	items: TriggerItem[];
	frontendValidationStatus?: FrontendProjectValidationProps;
}

export interface ProjectSettingsItem {
	id: string;
	name: string;
	varValue?: string;
	icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	errorMessage?: string;
	entrypoint?: string;
	integration?: (typeof Integrations)[keyof typeof Integrations];
}

export interface ConfigurationSectionListProps {
	accordionKey: string;
	items: ProjectSettingsItem[];
	title: string;
	actions: ProjectSettingsItemAction;
	onAdd: () => void;
	addButtonLabel?: string;
	emptyStateMessage?: string;
	validation?: {
		level?: ProjectValidationLevel;
		message?: string;
	};
	className?: string;
	isOpen?: boolean;
	id?: string;
	onToggle?: (isOpen: boolean) => void;
	section?: string;
	isLoading?: boolean;
}
