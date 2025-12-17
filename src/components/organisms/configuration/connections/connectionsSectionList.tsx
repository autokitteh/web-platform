import React from "react";

import { ConnectionItem } from "./connectionItem";
import { ConnectionsSectionListProps } from "@interfaces/components";
import { cn, generateItemIds } from "@src/utilities";

import { Accordion, AddButton } from "@components/molecules";
import { ConfigurationSkeletonLoader } from "@components/organisms/configuration/shared";

import { ChevronDownIcon, ChevronUpIcon } from "@assets/image/icons";

export const ConnectionsSectionList = (props: ConnectionsSectionListProps) => {
	const {
		id,
		items,
		title,
		emptyStateMessage,
		className,
		isOpen,
		onToggle,
		accordionKey,
		isLoading,
		frontendValidationStatus,
		isOrgConnection = false,
	} = props;

	const {
		actions,
		onAdd,
		addButtonLabel = "Add",
	} = !isOrgConnection ? (props as any) : { actions: undefined, onAdd: undefined, addButtonLabel: undefined };

	const entityType = isOrgConnection ? "org-connection" : "connection";

	return (
		<Accordion
			accordionKey={accordionKey}
			classChildren="py-0 min-h-9 mt-1"
			className={cn("w-full overflow-visible py-0", className)}
			closeIcon={ChevronUpIcon}
			componentOnTheRight={
				!isOrgConnection && onAdd ? (
					<AddButton addButtonLabel={addButtonLabel!} isLoading={isLoading} onAdd={onAdd} title={title} />
				) : undefined
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
					items.map(({ id, icon, name, statusInfoMessage, status: connectionStatus, integration }) => {
						const shouldShowTooltip = connectionStatus !== "ok" && statusInfoMessage;

						if (isOrgConnection) {
							return (
								<ConnectionItem
									connectionStatus={connectionStatus}
									icon={icon}
									id={id}
									ids={{
										connectionContainerId: `${id}-${entityType}-container`,
										connectionDisplayId: `${id}-${entityType}-display`,
									}}
									integration={integration}
									isOrgConnection
									key={id}
									name={name}
									shouldShowTooltip={!!shouldShowTooltip}
									statusInfoMessage={statusInfoMessage}
								/>
							);
						}

						const {
							containerId: connectionContainerId,
							displayId: connectionDisplayId,
							showEventsButtonId,
							configureButtonId,
							deleteButtonId,
							actionsContainerId,
						} = generateItemIds(id, "connection");

						const configureButtonIdForTour = `tourEdit${name}Connection_${integration}Integration`;

						if (!actions) return null;

						return (
							<ConnectionItem
								actions={actions}
								configureButtonIdForTour={configureButtonIdForTour}
								connectionStatus={connectionStatus}
								icon={icon}
								id={id}
								ids={{
									connectionContainerId,
									connectionDisplayId,
									showEventsButtonId,
									configureButtonId,
									deleteButtonId,
									actionsContainerId,
								}}
								integration={integration}
								key={id}
								name={name}
								shouldShowTooltip={!!shouldShowTooltip}
								statusInfoMessage={statusInfoMessage}
							/>
						);
					})
				) : (
					emptyStateMessage && <div className="flex h-9 items-center text-gray-400">{emptyStateMessage}</div>
				)}
			</div>
		</Accordion>
	);
};
