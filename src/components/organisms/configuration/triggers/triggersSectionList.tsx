import React from "react";

import { TriggersSectionListProps } from "@interfaces/components";
import { cn, getApiBaseUrl, generateItemIds } from "@src/utilities";

import { Button, IconSvg } from "@components/atoms";
import { Accordion, AddButton, CopyButton } from "@components/molecules";
import { PopoverContent, PopoverTrigger, PopoverWrapper } from "@components/molecules/popover";
import { ConfigurationSkeletonLoader } from "@components/organisms/configuration/shared";
import { TriggerItemDisplay } from "@components/organisms/configuration/triggers";

import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from "@assets/image/icons";

export const TriggersSectionList = ({
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
}: TriggersSectionListProps) => {
	const copyButtonClassName =
		"group flex h-6 w-[6.8rem] items-center justify-center rounded-md border border-gray-800 bg-transparent stroke-white px-2 py-0.5 hover:bg-transparent hover:stroke-green-800";
	const copyButtonTextClassName = "text-xs text-white group-hover:text-green-800";
	return (
		<Accordion
			accordionKey={accordionKey}
			classChildren="py-0 min-h-9 mt-1"
			className={cn("w-full overflow-visible py-0", className)}
			closeIcon={ChevronUpIcon}
			componentOnTheRight={
				<AddButton addButtonLabel={addButtonLabel} isLoading={isLoading} onAdd={onAdd} title={title} />
			}
			hideDivider
			id={id}
			isOpen={isOpen}
			key={accordionKey}
			onToggle={onToggle}
			openIcon={ChevronDownIcon}
			section={title}
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
					items.map((triggerItem) => {
						const { id, name, webhookSlug = "" } = triggerItem;
						const configureButtonClass = cn(
							"group my-0.5 mr-1 size-5 border-none p-0 hover:bg-transparent"
						);
						const configureIconClass = cn("size-[1.1rem] fill-white group-hover:fill-green-800");

						const apiBaseUrl = getApiBaseUrl();
						const webhookUrl = webhookSlug ? `${apiBaseUrl}/webhooks/${webhookSlug}` : undefined;

						const {
							containerId: triggerContainerId,
							displayId: triggerDisplayId,
							webhookUrlButtonId,
							showEventsButtonId,
							configureButtonId,
							deleteButtonId,
							actionsContainerId,
						} = generateItemIds(id, "trigger");

						return (
							<div
								className="relative flex cursor-pointer flex-row items-center justify-between rounded-lg border border-gray-700 bg-transparent p-2 transition-colors hover:bg-gray-1300/60"
								data-testid={`trigger-item-${name}`}
								id={triggerContainerId}
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
									id={triggerDisplayId}
								>
									<TriggerItemDisplay id={id} name={name} />
								</div>

								<div className="flex-1" />

								{webhookUrl ? (
									<PopoverWrapper interactionType="hover" placement="top">
										<PopoverTrigger>
											<div className="flex items-center gap-0">
												<CopyButton
													ariaLabel={`Copy ${name} webhook URL`}
													buttonText="URL"
													buttonTextClassName={copyButtonTextClassName}
													className={copyButtonClassName}
													dataTestId={`copy-${name}-webhook-url`}
													iconClassName="stroke-[0.5]"
													id={webhookUrlButtonId! as string}
													size="xs"
													text={webhookUrl}
													title={`Copy ${name} webhook URL`}
												/>
											</div>
										</PopoverTrigger>
										<PopoverContent className="max-w-md break-all border border-gray-700 bg-gray-900 p-1 text-xs text-white">
											<div className="flex flex-col gap-1">
												<span className="font-semibold">Click to copy the trigger URL:</span>
												<code className="text-xs text-gray-300">{webhookUrl}</code>
											</div>
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
												ariaLabel={`${actions.configure.ariaLabel} ${name}`}
												className={configureButtonClass}
												id={configureButtonId}
												onClick={(e) => {
													e.stopPropagation();
													actions.configure.onClick(id);
												}}
												title={`${actions.configure.ariaLabel} ${name}`}
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
												ariaLabel={`${actions.delete.ariaLabel} ${name}`}
												className="group border-none p-1 hover:bg-transparent"
												id={deleteButtonId}
												onClick={(e) => {
													e.stopPropagation();
													actions.delete.onClick(id);
												}}
												title={`${actions.delete.ariaLabel} ${name}`}
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
