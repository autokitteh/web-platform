import React from "react";

import { Integrations } from "@src/enums/components";
import { ProjectSettingsSection, ProjectValidationLevel } from "@src/types";

export interface ProjectSettingsItem {
	id: string;
	name: string;
	varValue?: string;
	icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	errorMessage?: string;
	entrypoint?: string;
	integration?: (typeof Integrations)[keyof typeof Integrations];
}

export type ProjectSettingsItemAction = {
	configure: {
		ariaLabel?: string;
		icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
		label: string;
		onClick: (itemId: string) => void;
	};
	custom?: {
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
};

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
	section?: ProjectSettingsSection;
	isLoading?: boolean;
}
