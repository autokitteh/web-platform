import React from "react";

import { useParams } from "react-router-dom";

import { TriggerInfoPopover } from "./triggers/triggerInfoPopover";
import { ConfigurationSectionListProps, ProjectSettingsItem, ProjectSettingsItemAction } from "@interfaces/components";
import { DrawerName } from "@src/enums/components";
import { useSharedBetweenProjectsStore } from "@src/store";
import { ProjectSettingsSection } from "@src/types";
import { cn } from "@src/utilities";

import { Button, IconSvg } from "@components/atoms";
import { Accordion } from "@components/molecules";
import { InfoPopover } from "@components/molecules/infoPopover";
import { PopoverContent, PopoverTrigger, PopoverWrapper } from "@components/molecules/popover";

import { ChevronDownIcon, ChevronUpIcon, CirclePlusIcon, TrashIcon } from "@assets/image/icons";

export { type ProjectSettingsItem, type ProjectSettingsItemAction };

interface InternalConfigurationSectionListProps extends ConfigurationSectionListProps {
	accordionKey: string;
	items: ProjectSettingsItem[];
	title: string;
	actions: ProjectSettingsItemAction;
	onAdd: () => void;
	addButtonLabel?: string;
	emptyStateMessage?: string;
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
	className,
	isOpen,
	onToggle,
	accordionKey,
	section,
	isLoading,
}: InternalConfigurationSectionListProps) => {
	const { projectId } = useParams();
	const drawerJustOpened = useSharedBetweenProjectsStore(
		(state) => (projectId ? state.drawerJustOpened[projectId]?.[DrawerName.projectSettings] : false) || false
	);

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
						<span className="flex items-center gap-2">
							{item.name}
							{connectionStateErrored ? (
								<Button
									ariaLabel={`Fix connection error: ${item.errorMessage}`}
									className="rounded-full bg-error px-2 py-0.5 text-xs font-medium text-white hover:brightness-90"
									onClick={() => actions.configure.onClick(item.id)}
									title={`Fix connection error: ${item.errorMessage}`}
								>
									{item.errorMessage}
								</Button>
							) : null}
						</span>
					</span>
				);
				break;
			}
		}
		return { component: displayValue, title: item.name };
	};

	const renderSkeletonLoaders = () => (
		<div className="space-y-1.5">
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
			<div className="space-y-1.5">
				{isLoading
					? renderSkeletonLoaders()
					: items && items.length > 0
						? items.map(({ id, icon, name, varValue, errorMessage, integration }) => {
								const itemContent = displaySectionItem({ id, icon, name, varValue, errorMessage });
								if (!itemContent) return "";
								const { component: ItemComponent, title } = itemContent;
								const hasError = section === "connections" && !!errorMessage;
								const hasWarning = section === "variables" && !varValue;
								const configureButtonClass = cn(
									"group my-0.5 size-6 border-none p-1 hover:bg-transparent",
									{
										"bg-gray-1100": hasError,
									},
									{
										"bg-gray-1100": hasWarning,
									}
								);
								const configureIconClass = cn(
									"size-4 stroke-white stroke-[1.25] group-hover:stroke-green-800",
									{
										"stroke-error stroke-2 hover:stroke-[2.5]":
											section === "connections" && !!errorMessage,
										"stroke-warning stroke-2 hover:stroke-[2.5]":
											section === "variables" && !varValue,
									}
								);

								const configureButtonIdForTour = `tourEdit${name}Connection_${integration}Integration`;

								return (
									<div
										className="relative flex flex-row items-center justify-between rounded-lg border border-gray-700 bg-gray-900 p-2"
										key={id}
									>
										<div className="ml-2 flex items-center gap-2">
											<div className="ml-0.5 min-w-0 flex-1 flex-row">
												<div
													className="flex items-center gap-2 truncate text-white"
													title={title}
												>
													{ItemComponent}
												</div>
											</div>
										</div>

										<div className="flex-1" />
										<div className="flex items-center gap-1" id="configuration-item-actions">
											{actions.custom && !hasError ? (
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

											{!hasError ? (
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
											) : null}

											<Button
												ariaLabel={actions.configure.ariaLabel}
												className={configureButtonClass}
												id={configureButtonIdForTour}
												onClick={() => actions.configure.onClick(id)}
												variant="outline"
											>
												<IconSvg className={configureIconClass} src={actions.configure.icon} />
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
