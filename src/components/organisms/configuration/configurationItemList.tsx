import React from "react";

import { useParams } from "react-router-dom";

import { InformationPopoverContent } from "../triggers/table/popoverContent";
import { DrawerName } from "@src/enums/components";
import { useSharedBetweenProjectsStore } from "@src/store";
import { ProjectValidationLevel, ProjectSettingsSection } from "@src/types";
import { cn } from "@src/utilities";

import { Button, IconSvg } from "@components/atoms";
import { Accordion } from "@components/molecules";
import { InfoPopover } from "@components/molecules/infoPopover";
import { PopoverContent, PopoverTrigger, PopoverWrapper } from "@components/molecules/popover";

import { ChevronDownIcon, ChevronUpIcon, CirclePlusIcon, TrashIcon } from "@assets/image/icons";

export interface ProjectSettingsItem {
	id: string;
	name: string;
	subtitle?: string;
	icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	errorMessage?: string;
	additionalFields?: Record<string, any>;
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

interface ProjectSettingsItemListProps {
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
	section: ProjectSettingsSection;
}

export const ProjectSettingsItemList = ({
	id,
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
	section,
}: ProjectSettingsItemListProps) => {
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

	return (
		<Accordion
			className={cn("w-full", className)}
			closeIcon={ChevronUpIcon}
			disableAnimation={!drawerJustOpened}
			hideDivider
			id={id}
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
					? items.map(({ id, icon, name, subtitle, errorMessage }) => (
							<div
								className="relative flex flex-row items-center justify-between rounded-lg border border-gray-700 bg-gray-900 p-2"
								key={id}
							>
								<div className="ml-2 flex items-center">
									{icon ? <IconSvg src={icon} /> : null}
									<div className="ml-0.5 min-w-0 flex-1 flex-row">
										<div
											className="flex items-center gap-2 truncate font-medium text-white"
											title={`${name}${subtitle ? `: ${subtitle}` : ""}${errorMessage ? `: ${errorMessage}` : ""}`}
										>
											{section === "triggers" ? (
												<div className="flex items-center gap-2">
													<InfoPopover>
														<InformationPopoverContent triggerId={id} />
													</InfoPopover>
													<span className="text-white">{name}</span>
												</div>
											) : (
												<span>{name}</span>
											)}
											{subtitle && section !== "triggers" ? (
												<span title={subtitle}>
													{": "}
													{subtitle}
												</span>
											) : null}
											{errorMessage ? (
												<span className="text-error">
													<span className="text-white">:</span> {errorMessage}
												</span>
											) : null}
										</div>
									</div>
								</div>

								<div className="flex-1" />
								<div className="flex items-center gap-1" id="configuration-item-actions">
									{actions.custom ? (
										<PopoverWrapper interactionType="hover" placement="top">
											<PopoverTrigger asChild>
												<Button
													ariaLabel={actions.custom.ariaLabel}
													className="group mr-1 size-6 border-none p-1 hover:bg-transparent"
													onClick={() => actions.custom!.onClick(id)}
													variant="outline"
												>
													<actions.custom.icon className="size-4 stroke-white stroke-[1.25] group-hover:stroke-green-800" />
												</Button>
											</PopoverTrigger>
											<PopoverContent className="border border-gray-700 bg-gray-900 px-2 py-1 text-xs font-medium text-white">
												{actions.custom.label}
											</PopoverContent>
										</PopoverWrapper>
									) : (
										<div className="flex w-6" />
									)}

									<PopoverWrapper interactionType="hover" placement="top">
										<PopoverTrigger asChild>
											<Button
												ariaLabel={actions.delete.ariaLabel}
												className="group border-none p-1 hover:bg-transparent"
												onClick={() => actions.delete.onClick(id)}
												variant="outline"
											>
												<TrashIcon className="size-4 stroke-white stroke-[1.25] group-hover:stroke-error" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="border border-gray-700 bg-gray-900 px-2 py-1 text-xs font-medium text-white">
											{actions.delete.label}
										</PopoverContent>
									</PopoverWrapper>

									<Button
										ariaLabel={actions.configure.ariaLabel}
										className="group my-0.5 w-[6.25rem] border-none py-0.5 hover:bg-transparent"
										onClick={() => actions.configure.onClick(id)}
										variant="outline"
									>
										<IconSvg
											className="absolute size-4 stroke-white stroke-[1.25] hover:stroke-[1.75] group-hover:stroke-green-800"
											src={actions.configure.icon}
										/>
										<span className="pl-5 text-sm text-white underline hover:font-semibold group-hover:text-green-800">
											{actions.configure.label}
										</span>
									</Button>
								</div>
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
