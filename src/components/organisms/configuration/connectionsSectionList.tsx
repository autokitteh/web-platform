import React from "react";

import { ConnectionItemDisplay } from "./connections/connectionItemDisplay";
import { ConfigurationSkeletonLoader } from "./shared/configurationSkeletonLoader";
import { ConnectionsSectionListProps } from "@interfaces/components";
import { cn, generateItemIds } from "@src/utilities";

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
	return (
		<Accordion
			accordionKey={accordionKey}
			classChildren="py-0 min-h-9 mt-1"
			className={cn("w-full overflow-visible py-0", className)}
			closeIcon={ChevronUpIcon}
			componentOnTheRight={
				<AddButton addButtonLabel={addButtonLabel} isLoading={isLoading} onAdd={onAdd} title={title} />
			}
			frontendValidationStatus={frontendValidationStatus}
			hideDivider
			id={id}
			isOpen={isOpen}
			key={accordionKey}
			onToggle={onToggle}
			openIcon={ChevronDownIcon}
			title={
				<>
					<span className="truncate">{title}</span>
					<span className="shrink-0">({items?.length || 0})</span>
				</>
			}
		>
			<div className="space-y-2">
				{isLoading ? (
					<ConfigurationSkeletonLoader />
				) : items && items.length > 0 ? (
					items.map(({ id, icon, name, errorMessage, integration }) => {
						const hasError = !!errorMessage;
						const configureButtonClass = cn(
							"group my-0.5 mr-1 size-5 border-none p-0 hover:bg-transparent"
						);
						const configureIconClass = cn("size-[1.1rem] fill-white group-hover:fill-green-800");

						const {
							containerId: connectionContainerId,
							displayId: connectionDisplayId,
							showEventsButtonId,
							configureButtonId,
							deleteButtonId,
							actionsContainerId,
						} = generateItemIds(id, "connection");

						const configureButtonIdForTour = `tourEdit${name}Connection_${integration}Integration`;

						return (
							<div
								className="relative flex cursor-pointer flex-row items-center justify-between rounded-lg border border-gray-700 bg-transparent p-2 transition-colors hover:bg-gray-1300/60"
								id={connectionContainerId}
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
								<div
									className="ml-2.5 flex w-2/5 text-white sm:w-1/4 xl:w-1/2 2xl:w-[65%]"
									id={connectionDisplayId}
								>
									<ConnectionItemDisplay item={{ id, icon, name, integration }} />
								</div>

								<div className="flex-1" />

								{hasError ? (
									<PopoverWrapper interactionType="hover" placement="top">
										<PopoverTrigger>
											<div className="flex w-fit items-center gap-0">
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
											Initialize connection
										</PopoverContent>
									</PopoverWrapper>
								) : null}
								<div className="relative z-10 flex items-center gap-1" id={actionsContainerId}>
									{actions.showEvents ? (
										<PopoverWrapper interactionType="hover" placement="top">
											<PopoverTrigger>
												<Button
													ariaLabel={actions.showEvents.ariaLabel}
													className="group mx-1 size-6 border-none p-1 hover:bg-transparent"
													disabled={hasError}
													id={showEventsButtonId}
													onClick={(e) => {
														e.stopPropagation();
														actions.showEvents!.onClick(id);
													}}
													variant="outline"
												>
													<actions.showEvents.icon className="size-4 stroke-white stroke-[1.25] group-hover:stroke-green-800" />
												</Button>
											</PopoverTrigger>
											<PopoverContent className="h-6 border border-gray-700 bg-gray-900 p-1 text-xs text-white">
												{actions.showEvents.label}
											</PopoverContent>
										</PopoverWrapper>
									) : (
										<div className="flex w-6" />
									)}

									<PopoverWrapper interactionType="hover" placement="top">
										<PopoverTrigger>
											<Button
												ariaLabel={actions.configure.ariaLabel}
												className={configureButtonClass}
												data-test-id={configureButtonId}
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
										<PopoverTrigger>
											<Button
												ariaLabel={actions.delete.ariaLabel}
												className="group border-none p-1 hover:bg-transparent"
												id={deleteButtonId}
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
					emptyStateMessage && <div className="flex h-9 items-center text-gray-400">{emptyStateMessage}</div>
				)}
			</div>
		</Accordion>
	);
};
