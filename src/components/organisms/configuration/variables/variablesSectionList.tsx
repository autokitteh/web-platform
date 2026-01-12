import React from "react";

import { VariableItemDisplay } from "./variableItemDisplay";
import { VariablesSectionListProps } from "@interfaces/components";
import { cn, generateItemIds } from "@src/utilities";

import { Button } from "@components/atoms";
import { Accordion, AddButton } from "@components/molecules";
import { PopoverContent, PopoverTrigger, PopoverWrapper } from "@components/molecules/popover";
import { ConfigurationSkeletonLoader } from "@components/organisms/configuration/shared";

import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from "@assets/image/icons";

export const VariablesSectionList = ({
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
}: VariablesSectionListProps) => {
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
					items.map((item) => {
						const { id, name, varValue } = item;
						const configureIconClass = cn("size-[1.1rem] fill-white group-hover:fill-green-800");

						const hasValue = varValue && varValue.trim() !== "";
						const {
							containerId: variableContainerId,
							displayId: variableDisplayId,
							actionsContainerId,
							modifyButtonId: setButtonId,
							configureButtonId,
							deleteButtonId,
						} = generateItemIds(id, "variable");
						return (
							<div
								className="flex rounded-lg border border-gray-700 bg-transparent p-2 transition-colors hover:bg-gray-1300/60"
								data-testid={`variable-item-${name}`}
								id={variableContainerId}
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
								<div className="ml-2.5 flex w-2/5 truncate text-white sm:w-1/4 xl:w-1/2 2xl:w-[65%]">
									<div
										className="flex w-full items-center gap-2 truncate text-white"
										id={variableDisplayId}
									>
										<VariableItemDisplay item={item} />
									</div>
								</div>
								<div className="flex-1" />
								{!hasValue ? (
									<PopoverWrapper interactionType="hover" placement="top">
										<PopoverTrigger>
											<div className="flex items-center">
												<Button
													ariaLabel={actions.configure.ariaLabel}
													className="flex h-6 w-[6.8rem] items-center justify-center rounded-md border border-gray-800 bg-transparent px-2 py-0.5 text-xs text-yellow-500 hover:brightness-90"
													data-testid={setButtonId}
													id={setButtonId}
													onClick={(e) => {
														e.stopPropagation();
														actions.configure.onClick(id);
													}}
													variant="outline"
												>
													Set
												</Button>
											</div>
										</PopoverTrigger>
										<PopoverContent className="h-6 border border-gray-700 bg-gray-900 p-1 text-xs text-white">
											{actions.configure.label}
										</PopoverContent>
									</PopoverWrapper>
								) : null}
								<div className="relative z-10 flex items-center gap-1" id={actionsContainerId}>
									<div className="flex w-6" />

									<PopoverWrapper interactionType="hover" placement="top">
										<PopoverTrigger>
											<Button
												ariaLabel={actions.configure.ariaLabel}
												className="group mr-1 size-5 border-none p-0 text-yellow-500 hover:bg-transparent"
												id={configureButtonId}
												onClick={(e) => {
													e.stopPropagation();
													actions.configure.onClick(id);
												}}
												variant="outline"
											>
												<actions.configure.icon className={configureIconClass} />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="border border-gray-700 bg-gray-900 p-1 text-xs text-white">
											{actions.configure.label}
										</PopoverContent>
									</PopoverWrapper>

									<PopoverWrapper interactionType="hover" placement="top">
										<PopoverTrigger>
											<Button
												ariaLabel={`${actions.delete.label} ${name}`}
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
										<PopoverContent className="border border-gray-700 bg-gray-900 p-1 text-xs text-white">
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
