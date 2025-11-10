import React, { useRef } from "react";

import { useParams } from "react-router-dom";

import { TriggerInfoPopover } from "./triggers/triggerInfoPopover";
import { TriggersSectionListProps } from "@interfaces/components";
import { DrawerName } from "@src/enums/components";
import { useSharedBetweenProjectsStore } from "@src/store";
import { cn, getApiBaseUrl } from "@src/utilities";

import { Button, IconSvg } from "@components/atoms";
import { Accordion, AddButton, CopyButton, CopyButtonRef } from "@components/molecules";
import { InfoPopover } from "@components/molecules/infoPopover";
import { PopoverContent, PopoverTrigger, PopoverWrapper } from "@components/molecules/popover";

import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from "@assets/image/icons";

const TriggerItemDisplay = ({
	id,
	apiBaseUrl,
	name,
	webhookSlug,
}: {
	apiBaseUrl: string;
	id: string;
	name: string;
	webhookSlug: string;
}) => {
	const webhookUrl = webhookSlug ? `${apiBaseUrl}/webhooks/${webhookSlug}` : undefined;
	const shortenedUrl = webhookUrl ? `...${webhookUrl.slice(-10)}` : undefined;

	const copyButtonRef = useRef<CopyButtonRef>(null);

	const handleCopyClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		copyButtonRef.current?.copy();
	};

	return (
		<span className="flex items-center gap-2">
			<InfoPopover title={`Trigger information for "${name}"`}>
				<TriggerInfoPopover triggerId={id!} />
			</InfoPopover>
			<span className="flex items-center gap-2">
				<span className="min-w-[60px] max-w-[60px] truncate sm:min-w-[70px] sm:max-w-[70px] md:min-w-[80px] md:max-w-[80px] lg:min-w-[85px] lg:max-w-[85px] xl:min-w-[90px] xl:max-w-[90px]">
					{name}
				</span>
				{webhookUrl ? (
					<PopoverWrapper interactionType="hover" placement="top">
						<PopoverTrigger asChild>
							<div className="flex w-full items-center gap-0">
								<Button
									ariaLabel="URL"
									className="group w-fit gap-0 rounded-md border border-gray-800 bg-transparent p-0 pl-2 text-xs text-white hover:brightness-90"
									onClick={handleCopyClick}
									title={webhookUrl}
								>
									{shortenedUrl}
									<CopyButton
										className="shrink-0 hover:bg-transparent group-hover:bg-transparent group-hover:stroke-green-800"
										ref={copyButtonRef}
										size="xs"
										text={webhookUrl}
									/>
								</Button>
							</div>
						</PopoverTrigger>
						<PopoverContent className="max-w-md break-all border border-gray-700 bg-gray-900 text-xs text-white">
							<div className="flex flex-col gap-1">
								<span className="font-semibold">Click to copy the trigger URL:</span>
								<code className="text-xs text-gray-300">{webhookUrl}</code>
							</div>
						</PopoverContent>
					</PopoverWrapper>
				) : null}
			</span>
		</span>
	);
};
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
	const { projectId } = useParams();
	const apiBaseUrl = getApiBaseUrl();
	const drawerJustOpened = useSharedBetweenProjectsStore(
		(state) => (projectId ? state.drawerJustOpened[projectId]?.[DrawerName.projectSettings] : false) || false
	);

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
			classChildren="py-0"
			className={cn("w-full overflow-visible py-0", className)}
			closeIcon={ChevronUpIcon}
			componentOnTheRight={
				<AddButton addButtonLabel={addButtonLabel} isLoading={isLoading} onAdd={onAdd} title={title} />
			}
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
				{isLoading
					? renderSkeletonLoaders()
					: items && items.length > 0
						? items.map((triggerItem) => {
								const { id, name, webhookSlug = "" } = triggerItem;
								const configureButtonClass = cn(
									"group my-0.5 mr-1 size-5 border-none p-0 hover:bg-transparent"
								);
								const configureIconClass = cn("size-[1.1rem] fill-white group-hover:fill-green-800");

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
											<div className="ml-0.5 min-w-0 flex-1 flex-row">
												<div
													className="flex items-center gap-2 truncate text-white"
													title={name}
												>
													<TriggerItemDisplay
														apiBaseUrl={apiBaseUrl}
														id={id}
														name={name}
														webhookSlug={webhookSlug}
													/>
												</div>
											</div>
										</div>

										<div className="flex-1" />
										<div
											className="relative z-10 flex items-center gap-1"
											id="configuration-item-actions"
										>
											{actions.custom ? (
												<PopoverWrapper interactionType="hover" placement="top">
													<PopoverTrigger asChild>
														<Button
															ariaLabel={actions.custom.ariaLabel}
															className="group mx-1 size-6 border-none p-1 hover:bg-transparent"
															onClick={(e) => {
																e.stopPropagation();
																actions.custom!.onClick(id);
															}}
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
														ariaLabel={`${actions.configure.ariaLabel} ${name}`}
														className={configureButtonClass}
														onClick={(e) => {
															e.stopPropagation();
															actions.configure.onClick(id);
														}}
														title={`${actions.configure.ariaLabel} ${name}`}
														variant="outline"
													>
														<IconSvg
															className={configureIconClass}
															src={actions.configure.icon}
														/>
													</Button>
												</PopoverTrigger>
												<PopoverContent className="border border-gray-700 bg-gray-900 px-2 py-1 text-xs font-medium text-white">
													{actions.configure.label}
												</PopoverContent>
											</PopoverWrapper>

											<PopoverWrapper interactionType="hover" placement="top">
												<PopoverTrigger asChild>
													<Button
														ariaLabel={`${actions.delete.ariaLabel}} ${name}`}
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
												<PopoverContent className="border border-gray-700 bg-gray-900 px-2 py-1 text-xs font-medium text-white">
													{actions.delete.label}
												</PopoverContent>
											</PopoverWrapper>
										</div>
									</div>
								);
							})
						: emptyStateMessage && <div className="text-gray-400">{emptyStateMessage}</div>}
			</div>
		</Accordion>
	);
};
