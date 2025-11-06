import React from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { DrawerName } from "@src/enums/components";
import { useSharedBetweenProjectsStore } from "@src/store";
import { ProjectValidationLevel } from "@src/types";
import { cn } from "@src/utilities";

import { Button, IconButton, IconSvg } from "@components/atoms";
import { Accordion, DropdownButton } from "@components/molecules";

import { MoreIcon } from "@assets/image";
import { ChevronDownIcon, ChevronUpIcon, CirclePlusIcon, EditIcon, TrashIcon } from "@assets/image/icons";

export interface ProjectSettingsItem {
	id: string;
	name: string;
	subtitle?: string;
	icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	status?: "ok" | "error" | "warning";
	statusMessage?: string;
	additionalFields?: Record<string, any>;
}

export interface ProjectSettingsItemAction {
	type: "edit" | "delete" | "custom";
	label: string;
	icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	onClick: (itemId: string) => void;
	ariaLabel?: string;
}

interface ProjectSettingsItemListProps {
	accordionKey: string;
	items: ProjectSettingsItem[];
	title: string;
	actions: ProjectSettingsItemAction[];
	onAdd: () => void;
	addButtonLabel?: string;
	emptyStateMessage?: string;
	validation?: {
		level?: ProjectValidationLevel;
		message?: string;
	};
	className?: string;
	isOpen?: boolean;
	onToggle?: (isOpen: boolean) => void;
}

export const ProjectSettingsItemList = ({
	items,
	title,
	actions,
	onAdd,
	addButtonLabel = "Add",
	emptyStateMessage,
	validation,
	className,
	isOpen,
	onToggle,
	accordionKey,
}: ProjectSettingsItemListProps) => {
	const { t } = useTranslation("project-configuration-view");
	const { projectId } = useParams();
	const drawerJustOpened = useSharedBetweenProjectsStore(
		(state) => (projectId ? state.drawerJustOpened[projectId]?.[DrawerName.projectSettings] : false) || false
	);

	const validationColor = validation?.message
		? validation?.level === "error"
			? "text-red-500"
			: validation?.level === "warning"
				? "text-yellow-500"
				: "text-green-500"
		: "";
	const validationClass = validation?.message ? cn(validationColor, "mb-2 text-sm") : "";

	const getStatusIcon = (status?: string) => {
		switch (status) {
			case "ok":
				return <span className="text-green-500">✓</span>;
			case "error":
				return <span className="text-red-500">✗</span>;
			case "warning":
				return <span className="text-yellow-500">⚠</span>;
			default:
				return null;
		}
	};

	const renderActionIcon = (action: ProjectSettingsItemAction) => {
		if (action.icon) {
			return <action.icon className="size-3 fill-white" />;
		}

		switch (action.type) {
			case "edit":
				return <EditIcon className="size-3 fill-white" />;
			case "delete":
				return <TrashIcon className="size-4 stroke-white" />;
			default:
				return null;
		}
	};

	return (
		<Accordion
			className={cn("w-full", className)}
			closeIcon={ChevronUpIcon}
			disableAnimation={!drawerJustOpened}
			hideDivider
			isOpen={isOpen}
			key={accordionKey}
			onToggle={onToggle}
			openIcon={ChevronDownIcon}
			title={`${title} (${items?.length || 0})`}
		>
			<div className="space-y-2">
				{validation?.level && validation?.message ? (
					<div className={validationClass}>{validation.message}</div>
				) : null}
				{items && items.length > 0
					? items.map((item) => (
							<div
								className="group relative flex flex-row items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 p-2"
								key={item.id}
							>
								{item.icon ? <IconSvg src={item.icon} /> : null}
								<div className="ml-0.5 min-w-0 flex-1">
									<div className="truncate font-medium text-white">{item.name}</div>
									{item.subtitle ? (
										<div className="flex text-xs text-gray-400">
											<span className="truncate">{item.subtitle}</span>
										</div>
									) : null}
								</div>

								{item.status ? (
									<div className="flex size-6 items-center justify-center text-sm">
										{getStatusIcon(item.status)}
									</div>
								) : null}

								<DropdownButton
									ariaLabel={t("actions.more")}
									contentMenu={
										<div className="flex flex-col gap-1">
											{actions.map((action, index) => (
												<button
													aria-label={action.ariaLabel || action.label}
													className="ml-0.5 flex h-8 w-160 items-center gap-2 justify-self-auto px-1 text-white hover:text-green-800"
													key={index}
													onClick={() => action.onClick(item.id)}
													type="button"
												>
													{renderActionIcon(action)}
													<span className="text-sm">{action.label}</span>
												</button>
											))}
										</div>
									}
								>
									<IconButton ariaLabel={t("actions.more")} className="size-8">
										<IconSvg
											className="fill-white transition group-hover:fill-green-200 group-active:fill-green-800"
											size="md"
											src={MoreIcon}
										/>
									</IconButton>
								</DropdownButton>
							</div>
						))
					: emptyStateMessage && <div className="text-gray-400">{emptyStateMessage}</div>}
				<div className="flex w-full justify-end">
					<Button
						ariaLabel={`Add ${title}`}
						className="group !p-0 hover:bg-transparent hover:font-semibold"
						onClick={onAdd}
					>
						<CirclePlusIcon className="size-3 stroke-green-800 stroke-[1.225] transition-all group-hover:stroke-[2]" />
						<span className="text-sm text-green-800">{addButtonLabel}</span>
					</Button>
				</div>
			</div>
		</Accordion>
	);
};
