import React from "react";

import { FrontendProjectValidationProps } from ".";
import { Integrations } from "@src/enums/components";
import { ProjectValidationLevel } from "@src/types";
import { ConnectionStatusType } from "@src/types/models";

export interface VariableItem {
	description?: string;
	isSecret?: boolean;
	id: string;
	name: string;
	varValue?: string;
}

export interface ConnectionItem {
	id: string;
	name: string;
	statusInfoMessage?: string;
	status: ConnectionStatusType;
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
		wholeButtonClickAria?: string;
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

type ProjectConnectionsSectionListProps = BaseConfigurationSectionListProps & {
	frontendValidationStatus?: FrontendProjectValidationProps;
	isOrgConnection?: false;
	items: ConnectionItem[];
};

type OrgConnectionsSectionListProps = Omit<
	BaseConfigurationSectionListProps,
	"actions" | "onAdd" | "addButtonLabel"
> & {
	frontendValidationStatus?: FrontendProjectValidationProps;
	isOrgConnection: true;
	items: ConnectionItem[];
};

export type ConnectionsSectionListProps = ProjectConnectionsSectionListProps | OrgConnectionsSectionListProps;

export interface ConnectionInfoPopoverProps {
	connectionId: string;
	icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	isOrgConnection?: boolean;
}

export interface ConnectionItemDisplayProps {
	item: ConnectionItem;
	isOrgConnection?: boolean;
}

export interface TriggersSectionListProps extends BaseConfigurationSectionListProps {
	onAdd: () => void;
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
