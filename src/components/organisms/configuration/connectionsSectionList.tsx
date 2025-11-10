import React from "react";

import { useParams } from "react-router-dom";

import { ConnectionItem, ConnectionsSectionListProps } from "@interfaces/components";
import { DrawerName } from "@src/enums/components";
import { useSharedBetweenProjectsStore } from "@src/store";
import { cn } from "@src/utilities";

import { Button, IconSvg } from "@components/atoms";
import { Accordion } from "@components/molecules";
import { PopoverContent, PopoverTrigger, PopoverWrapper } from "@components/molecules/popover";

import { ChevronDownIcon, ChevronUpIcon, CirclePlusIcon, TrashIcon } from "@assets/image/icons";

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
}: ConnectionsSectionListProps) => {
	const { projectId } = useParams();
	const drawerJustOpened = useSharedBetweenProjectsStore(
		(state) => (projectId ? state.drawerJustOpened[projectId]?.[DrawerName.projectSettings] : false) || false
	);

	const displayConnectionItem = (item: ConnectionItem) => {
		const connectionStateErrored = !!item.errorMessage;
		return (
			<span className="flex items-center gap-2">
				{item?.icon ? <IconSvg className="rounded-full bg-white p-1" size="md" src={item.icon} /> : null}
				<span className="flex items-center gap-2">
					<span className="min-w-[60px] max-w-[60px] truncate sm:min-w-[70px] sm:max-w-[70px] md:min-w-[80px] md:max-w-[80px] lg:min-w-[85px] lg:max-w-[85px] xl:min-w-[90px] xl:max-w-[90px]">
						{item.name}
					</span>
					{connectionStateErrored ? (
						<Button
							ariaLabel={`Fix connection error: ${item.errorMessage}`}
							className="rounded-md bg-transparent px-2 py-0.5 text-xs text-error hover:brightness-90"
							onClick={() => actions.configure.onClick(item.id)}
							title={`Fix connection error: ${item.errorMessage}`}
						>
							{item.errorMessage}
						</Button>
					) : null}
				</span>
			</span>
		);
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
			classChildren="py-0"
			className={cn("w-full overflow-visible py-0", className)}
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
				{isLoading
					? renderSkeletonLoaders()
					: items && items.length > 0
						? items.map(({ id, icon, name, errorMessage, integration }) => {
								const ItemComponent = displayConnectionItem({
									id,
									icon,
									name,
									errorMessage,
									integration,
								});
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
											<div className="ml-0.5 min-w-0 flex-1 flex-row">
												<div
													className="flex items-center gap-2 truncate text-white"
													title={name}
												>
													{ItemComponent}
												</div>
											</div>
										</div>

										<div className="flex-1" />
										<div
											className="relative z-10 flex items-center gap-1"
											id="configuration-item-actions"
										>
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
													<PopoverContent className="border border-gray-700 bg-gray-900 px-2 py-1 text-xs text-white">
														{actions.custom.label}
													</PopoverContent>
												</PopoverWrapper>
											) : (
												<div className="flex w-6" />
											)}

											<Button
												ariaLabel={actions.configure.ariaLabel}
												className={configureButtonClass}
												id={configureButtonIdForTour}
												onClick={(e) => {
													e.stopPropagation();
													actions.configure.onClick(id);
												}}
												variant="outline"
											>
												<IconSvg className={configureIconClass} src={actions.configure.icon} />
											</Button>

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
												<PopoverContent className="border border-gray-700 bg-gray-900 px-2 py-1 text-xs text-white">
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
