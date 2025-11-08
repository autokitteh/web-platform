import React from "react";

import { useParams } from "react-router-dom";

import { TriggerInfoPopover } from "./triggers/triggerInfoPopover";
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
	varValue?: string;
	icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	errorMessage?: string;
	entrypoint?: string;
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

interface ConfigurationSectionListProps {
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

export const ConfigurationSectionList = ({
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
	isLoading,
}: ConfigurationSectionListProps) => {
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

	const displaySectionItem = (item: ProjectSettingsItem) => {
		let displayValue: React.ReactNode = null;

		switch (section) {
			case "variables": {
				const hasValue = item.varValue && item.varValue.trim() !== "";
				displayValue = (
					<span className="flex items-center gap-2">
						{item.name}: {hasValue ? item.varValue : <span className="text-warning">Not set</span>}
					</span>
				);
				break;
			}
			case "triggers":
				displayValue = (
					<span>
						<div className="flex items-center gap-2">
							<InfoPopover>
								<TriggerInfoPopover triggerId={item.id!} />
							</InfoPopover>
							<span className="text-white">{item.name}</span>
						</div>
						{item?.entrypoint ? `: ${item.entrypoint}` : ""}
					</span>
				);
				break;
			case "connections": {
				const connectionStateErrored = !!item.errorMessage;
				displayValue = (
					<span className="flex items-center gap-2">
						{item?.icon ? <IconSvg src={item.icon} /> : null}
						<span>
							{item.name}
							{connectionStateErrored ? <span className="text-error">: Init Required</span> : ""}
						</span>
					</span>
				);
				break;
			}
		}
		return { component: displayValue, title: item.name };
	};

	const renderSkeletonLoaders = () => (
		<div className="space-y-2">
			{[...Array(3)].map((_, index) => (
				<div
					className="relative flex flex-row items-center justify-between rounded-lg border border-gray-700 bg-gray-900 p-2"
					key={index}
				>
					<div className="ml-2 flex flex-1 items-center gap-2">
						<div className="h-4 w-1/3 animate-pulse rounded bg-gray-700" />
					</div>
					<div className="flex items-center gap-1">
						<div className="size-6 animate-pulse rounded bg-gray-700" />
						<div className="size-6 animate-pulse rounded bg-gray-700" />
						<div className="h-6 w-20 animate-pulse rounded bg-gray-700" />
					</div>
				</div>
			))}
		</div>
	);

	return (
		<Accordion
			className={cn("w-full overflow-visible", className)}
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
				{isLoading
					? renderSkeletonLoaders()
					: items && items.length > 0
						? items.map(({ id, icon, name, varValue, errorMessage }) => {
								const itemContent = displaySectionItem({ id, icon, name, varValue, errorMessage });
								if (!itemContent) return "";
								const { component: ItemComponent, title } = itemContent;
								const hasError = section === "connections" && !!errorMessage;
								const hasWarning = section === "variables" && !varValue;
								const configureButtonClass = cn(
									"group my-0.5 w-[6.25rem] border-none py-0.5 hover:bg-transparent",
									{
										"bg-gray-1100": hasError,
									},
									{
										"bg-gray-1100": hasWarning,
									}
								);
								const configureIconClass = cn(
									"absolute size-4 stroke-white stroke-[1.25] hover:stroke-[1.75] group-hover:stroke-green-800",
									{
										"stroke-error stroke-2 hover:stroke-[2.5]":
											section === "connections" && !!errorMessage,
										"stroke-warning stroke-2 hover:stroke-[2.5]":
											section === "variables" && !varValue,
									}
								);
								const configureTextClass = cn(
									"pl-5 text-sm text-white underline hover:font-semibold group-hover:text-green-800",
									{
										"text-error font-semibold hover:font-bold":
											section === "connections" && !!errorMessage,
										"text-warning font-semibold hover:font-bold":
											section === "variables" && !varValue,
									}
								);
								return (
									<div
										className="relative flex flex-row items-center justify-between rounded-lg border border-gray-700 bg-gray-900 p-2"
										key={id}
									>
										<div className="ml-2 flex items-center gap-2">
											<div className="ml-0.5 min-w-0 flex-1 flex-row">
												<div
													className="flex items-center gap-2 truncate font-medium text-white"
													title={title}
												>
													{ItemComponent}
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
												className={configureButtonClass}
												onClick={() => actions.configure.onClick(id)}
												variant="outline"
											>
												<IconSvg className={configureIconClass} src={actions.configure.icon} />
												<span className={configureTextClass}>{actions.configure.label}</span>
											</Button>
										</div>
									</div>
								);
							})
						: emptyStateMessage && <div className="text-gray-400">{emptyStateMessage}</div>}
				{!isLoading ? (
					<div className="flex w-full justify-end">
						<Button
							ariaLabel={`Add ${title}`}
							className="group flex items-center gap-2 !p-0 hover:bg-transparent hover:font-semibold"
							onClick={onAdd}
						>
							<CirclePlusIcon className="size-4 stroke-green-800 stroke-[2] transition-all group-hover:stroke-[2]" />
							<span className="text-sm text-green-800">{addButtonLabel}</span>
						</Button>
					</div>
				) : null}
			</div>
		</Accordion>
	);
};
