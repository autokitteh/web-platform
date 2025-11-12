import React from "react";

import { SkeletonLoader } from "./shared/skeletonLoader";
import { VariableItemDisplay } from "./variables/variableItemDisplay";
import { VariablesSectionListProps } from "@interfaces/components";
import { cn, generateItemIds } from "@src/utilities";

import { Button } from "@components/atoms";
import { Accordion, AddButton } from "@components/molecules";
import { PopoverContent, PopoverTrigger, PopoverWrapper } from "@components/molecules/popover";

import { ChevronDownIcon, ChevronUpIcon, LockSolid, TrashIcon } from "@assets/image/icons";

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
			title={`${title} (${items?.length || 0})`}
		>
			<div className="space-y-2">
				{isLoading ? (
					<SkeletonLoader />
				) : items && items.length > 0 ? (
					items.map(({ id, name, varValue, isSecret }) => {
						const configureIconClass = cn("size-[1.1rem] fill-white group-hover:fill-green-800");

						const hasValue = varValue && varValue.trim() !== "";
						const {
							containerId: variableContainerId,
							displayId: variableDisplayId,
							valueId: variableValueId,
							actionsContainerId,
							modifyButtonId: setButtonId,
							configureButtonId,
							deleteButtonId,
						} = generateItemIds(id, "variable");
						return (
							<div
								className="flex rounded-lg border border-gray-700 bg-transparent p-2 transition-colors hover:bg-gray-1300/60"
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
								<div className="relative flex w-full cursor-pointer flex-col justify-center">
									<div className="ml-2 flex w-full items-center gap-2">
										<div className="ml-0.5 flex-1 flex-row">
											<div
												className="flex w-full items-center gap-2 truncate text-white"
												id={variableDisplayId}
												title={name}
											>
												<VariableItemDisplay item={{ id, name, varValue, isSecret }} />
											</div>
										</div>
									</div>
									{hasValue ? (
										<div
											className="ml-11 flex flex-row items-center gap-x-2 text-white"
											id={variableValueId}
										>
											Value:
											{!isSecret ? (
												<span className="text-white">
													<code>{varValue}</code>
												</span>
											) : (
												<div className="flex w-full flex-row items-center truncate">
													<LockSolid className="size-3 fill-white" />
													<div className="ml-2 mt-2 text-white">**********</div>
												</div>
											)}
										</div>
									) : null}
								</div>

								{!hasValue ? (
									<PopoverWrapper interactionType="hover" placement="top">
										<PopoverTrigger asChild>
											<div className="flex items-center">
												<Button
													ariaLabel={actions.configure.ariaLabel}
													className="flex h-6 w-[6.8rem] items-center justify-center rounded-md border border-gray-800 bg-transparent px-2 py-0.5 text-xs text-yellow-500 hover:brightness-90"
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
										<PopoverTrigger asChild>
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
										<PopoverTrigger asChild>
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
					emptyStateMessage && <div className="text-gray-400">{emptyStateMessage}</div>
				)}
			</div>
		</Accordion>
	);
};
