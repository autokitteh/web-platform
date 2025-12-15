import React from "react";

import { OrgConnectionInfoPopover } from "./orgConnectionInfoPopover";
import { ConnectionItem } from "@interfaces/components";
import { cn } from "@src/utilities";

import { Accordion, ConnectionTableStatus } from "@components/molecules";
import { PopoverContent, PopoverTrigger, PopoverWrapper } from "@components/molecules/popover";
import { ConfigurationSkeletonLoader } from "@components/organisms/configuration/shared";

import { ChevronDownIcon, ChevronUpIcon } from "@assets/image/icons";

export interface OrgConnectionsSectionListProps {
	id?: string;
	items: ConnectionItem[];
	title: string;
	accordionKey: string;
	emptyStateMessage?: string;
	className?: string;
	isOpen?: boolean;
	onToggle?: (isOpen: boolean) => void;
	isLoading?: boolean;
}

export const OrgConnectionsSectionList = ({
	id,
	items,
	title,
	className,
	isOpen,
	onToggle,
	accordionKey,
	isLoading,
	emptyStateMessage,
}: OrgConnectionsSectionListProps) => {
	return (
		<Accordion
			accordionKey={accordionKey}
			classChildren="py-0 min-h-9 mt-1"
			className={cn("w-full overflow-visible py-0", className)}
			closeIcon={ChevronUpIcon}
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
					items.map(({ id, icon, name, statusInfoMessage, status: connectionStatus }) => {
						const shouldShowTooltip = connectionStatus !== "ok" && statusInfoMessage;

						return (
							<div
								className="relative flex flex-row items-center justify-between rounded-lg border border-gray-700 bg-transparent p-2 transition-colors"
								id={`${id}-org-connection-container`}
								key={id}
							>
								<div
									className="ml-2.5 flex w-2/5 text-white sm:w-1/4 xl:w-1/2 2xl:w-[65%]"
									id={`${id}-org-connection-display`}
								>
									<div className="flex items-center gap-x-3 truncate">
										<OrgConnectionInfoPopover connectionId={id} icon={icon} />
										<span className="truncate">{name}</span>
									</div>
								</div>

								<div className="flex-1" />

								{shouldShowTooltip ? (
									<PopoverWrapper interactionType="hover" placement="top">
										<PopoverTrigger>
											<div className="flex w-fit items-center gap-0">
												<ConnectionTableStatus status={connectionStatus} />
											</div>
										</PopoverTrigger>
										<PopoverContent className="h-6 max-w-md break-all border border-gray-700 bg-gray-900 p-1 text-xs text-white">
											{statusInfoMessage}
										</PopoverContent>
									</PopoverWrapper>
								) : (
									<ConnectionTableStatus status={connectionStatus} />
								)}
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
