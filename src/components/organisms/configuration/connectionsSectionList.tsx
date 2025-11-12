import React from "react";

import { useParams } from "react-router-dom";

import { ConnectionItemDisplay } from "./connections/connectionItemDisplay";
import { SkeletonLoader } from "./shared/skeletonLoader";
import { ConnectionsSectionListProps } from "@interfaces/components";
import { DrawerName } from "@src/enums/components";
import { useSharedBetweenProjectsStore } from "@src/store";
import { cn } from "@src/utilities";

import { Button, IconSvg } from "@components/atoms";
import { Accordion, AddButton } from "@components/molecules";
import { PopoverContent, PopoverTrigger, PopoverWrapper } from "@components/molecules/popover";

import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from "@assets/image/icons";

export const ConnectionsSectionList = ({
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
	isLoading,
	frontendValidationStatus,
}: ConnectionsSectionListProps) => {
	const { projectId } = useParams();
	const drawerJustOpened = useSharedBetweenProjectsStore(
		(state) => (projectId ? state.drawerJustOpened[projectId]?.[DrawerName.projectSettings] : false) || false
	);

	return (
		<Accordion
			accordionKey={accordionKey}
			classChildren="py-0 min-h-9 mt-1"
			className={cn("w-full overflow-visible py-0", className)}
			closeIcon={ChevronUpIcon}
			componentOnTheRight={
				<AddButton addButtonLabel={addButtonLabel} isLoading={isLoading} onAdd={onAdd} title={title} />
			}
			disableAnimation={!drawerJustOpened}
			frontendValidationStatus={frontendValidationStatus}
			hideDivider
			id={id}
			isOpen={isOpen}
			key={accordionKey}
			onToggle={onToggle}
			openIcon={ChevronDownIcon}
			title={`${title} (${items?.length || 0})`}
		>
			<div className="space-y-2">
				{isLoading ? (
					<SkeletonLoader />
				) : items && items.length > 0 ? (
					items.map(({ id, icon, name, errorMessage, integration }) => {
						const hasError = !!errorMessage;
						const configureButtonClass = cn(
							"group my-0.5 mr-1 size-5 border-none p-0 hover:bg-transparent"
						);
						const configureIconClass = cn("size-[1.1rem] fill-white group-hover:fill-green-800");

						const configureButtonIdForTour = `tourEdit${name}Connection_${integration}Integration`;

						return (
							<div
								className="relative flex cursor-pointer flex-row items-center justify-between rounded-lg border border-gray-700 bg-transparent p-2 transition-colors hover:bg-gray-1300/60"
								key={id}
								onClick={() => actions.configure.onClick(id)}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										actions.configure.onClick(id);
									}
								}}
								role="button"
								tabIndex={0}
							>
								<div className="ml-2 flex items-center gap-2">
									<div className="ml-0.5 flex-1 flex-row">
										<div className="flex w-60 items-center gap-2 truncate text-white" title={name}>
											<ConnectionItemDisplay item={{ id, icon, name, integration }} />
										</div>
									</div>
								</div>

								{hasError ? (
									<PopoverWrapper interactionType="hover" placement="top">
										<PopoverTrigger asChild>
											<div className="flex w-full items-center gap-0">
												<Button
													ariaLabel={`Fix connection error: ${errorMessage}`}
													className="w-[6.8rem] justify-center rounded-md border border-gray-800 bg-transparent px-2 py-0.5 text-xs text-error hover:brightness-90"
													onClick={() => actions.configure.onClick(id)}
													title={`Fix connection error: ${errorMessage}`}
												>
													Init
												</Button>
											</div>
										</PopoverTrigger>
										<PopoverContent className="h-6 max-w-md break-all border border-gray-700 bg-gray-900 p-1 text-xs text-white">
											<span className="font-semibold">Initialize connection</span>
										</PopoverContent>
									</PopoverWrapper>
								) : null}
								<div className="relative z-10 flex items-center gap-1" id="configuration-item-actions">
									{actions.custom && !hasError ? (
										<PopoverWrapper interactionType="hover" placement="top">
											<PopoverTrigger asChild>
												<Button
													ariaLabel={actions.custom.ariaLabel}
													className="group mr-1 size-6 border-none hover:bg-transparent"
													onClick={(e) => {
														e.stopPropagation();
														actions.custom!.onClick(id);
													}}
													variant="outline"
												>
													<actions.custom.icon className="size-4 stroke-white stroke-[1.25] group-hover:stroke-green-800" />
												</Button>
											</PopoverTrigger>
											<PopoverContent className="h-6 border border-gray-700 bg-gray-900 p-1 text-xs text-white">
												{actions.custom.label}
											</PopoverContent>
										</PopoverWrapper>
									) : (
										<div className="flex w-6" />
									)}

									<PopoverWrapper interactionType="hover" placement="top">
										<PopoverTrigger asChild>
											<Button
												ariaLabel={actions.configure.ariaLabel}
												className={configureButtonClass}
												id={configureButtonIdForTour}
												onClick={(e) => {
													e.stopPropagation();
													actions.configure.onClick(id);
												}}
												title={actions.configure.ariaLabel}
												variant="outline"
											>
												<IconSvg className={configureIconClass} src={actions.configure.icon} />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="h-6 border border-gray-700 bg-gray-900 p-1 text-xs text-white">
											{actions.configure.label}
										</PopoverContent>
									</PopoverWrapper>

									<PopoverWrapper interactionType="hover" placement="top">
										<PopoverTrigger asChild>
											<Button
												ariaLabel={actions.delete.ariaLabel}
												className="group border-none p-1 hover:bg-transparent"
												onClick={(e) => {
													e.stopPropagation();
													actions.delete.onClick(id);
												}}
												variant="outline"
											>
												<TrashIcon className="size-4 stroke-white stroke-[1.25] group-hover:stroke-error" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="h-6 border border-gray-700 bg-gray-900 p-1 text-xs text-white">
											{actions.delete.label}
										</PopoverContent>
									</PopoverWrapper>
								</div>
							</div>
						);
					})
				) : (
					emptyStateMessage && <div className="text-gray-400">{emptyStateMessage}</div>
				)}
			</div>
		</Accordion>
	);
};
