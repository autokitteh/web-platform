import React, { DragEvent, useState } from "react";

import { LuChevronDown, LuPlug, LuPlus } from "react-icons/lu";

import { fitleredIntegrationsMap, Integrations } from "@src/enums/components";
import { IntegrationSelectOption } from "@src/interfaces/components/forms";
import { cn } from "@src/utilities";
import { useWorkflowBuilderStore } from "@store/useWorkflowBuilderStore";

import { IconSvg, Typography } from "@components/atoms";

interface ProjectConnection {
	name: string;
	integration: Integrations;
	displayName: string;
}

interface DraggableConnectionProps {
	connection: ProjectConnection;
	onDragStart: (event: DragEvent<HTMLDivElement>, connection: ProjectConnection) => void;
}

const DraggableConnection = ({ connection, onDragStart }: DraggableConnectionProps) => {
	const integration = fitleredIntegrationsMap[connection.integration];
	const icon = integration?.icon;

	return (
		<div
			className="flex cursor-grab items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 transition-all hover:border-gray-500 hover:bg-gray-800 active:cursor-grabbing"
			draggable
			onDragStart={(event) => onDragStart(event, connection)}
		>
			<div className="flex size-6 items-center justify-center rounded-full bg-white p-0.5">
				{icon ? <IconSvg className="size-4" src={icon} /> : null}
			</div>
			<div className="min-w-0 flex-1">
				<Typography className="truncate font-medium text-white" element="span" size="small">
					{connection.name}
				</Typography>
				<Typography className="block truncate text-gray-500" element="span" size="small">
					{connection.displayName}
				</Typography>
			</div>
			<span className="size-2 rounded-full bg-green-500" />
		</div>
	);
};

interface DraggableIntegrationProps {
	integration: IntegrationSelectOption;
	onDragStart: (event: DragEvent<HTMLDivElement>, integration: IntegrationSelectOption) => void;
}

const DraggableIntegration = ({ integration, onDragStart }: DraggableIntegrationProps) => {
	return (
		<div
			className="flex cursor-grab flex-col items-center justify-center gap-1 rounded-lg border border-gray-750 bg-gray-1000 p-2 transition-all hover:border-gray-500 hover:bg-gray-900 active:cursor-grabbing"
			draggable
			onDragStart={(event) => onDragStart(event, integration)}
		>
			<div className="flex size-8 items-center justify-center rounded-full bg-white p-0.5">
				<IconSvg className="size-6" src={integration.icon} />
			</div>
			<Typography className="text-center text-gray-300" element="span" size="small">
				{integration.label}
			</Typography>
		</div>
	);
};

export const ConnectionsSection = () => {
	const [isExpanded, setIsExpanded] = useState(true);
	const [showAvailable, setShowAvailable] = useState(false);
	const { getConnectionNodes } = useWorkflowBuilderStore();

	const connectionNodes = getConnectionNodes();
	const projectConnections: ProjectConnection[] = connectionNodes.map((node) => ({
		name: node.data.connectionName,
		integration: node.data.integration,
		displayName: node.data.displayName,
	}));

	const availableIntegrations = Object.values(fitleredIntegrationsMap).sort((a, b) => a.label.localeCompare(b.label));

	const handleConnectionDragStart = (event: DragEvent<HTMLDivElement>, connection: ProjectConnection) => {
		const dragData = {
			nodeType: "connection",
			connectionName: connection.name,
			integration: connection.integration,
			displayName: connection.displayName,
			isExisting: true,
		};
		event.dataTransfer.setData("application/workflow-node", JSON.stringify(dragData));
		event.dataTransfer.effectAllowed = "move";
	};

	const handleIntegrationDragStart = (event: DragEvent<HTMLDivElement>, integration: IntegrationSelectOption) => {
		const dragData = {
			nodeType: "connection",
			integration: integration.value,
			displayName: integration.label,
			isExisting: false,
		};
		event.dataTransfer.setData("application/workflow-node", JSON.stringify(dragData));
		event.dataTransfer.effectAllowed = "move";
	};

	return (
		<div className="border-b border-gray-750">
			<button
				className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-900"
				onClick={() => setIsExpanded(!isExpanded)}
				type="button"
			>
				<div className="flex items-center gap-2">
					<LuPlug className="size-4 text-green-400" />
					<Typography className="font-medium text-white" element="span" size="small">
						Connections
					</Typography>
					{projectConnections.length > 0 ? (
						<span className="rounded-full bg-green-900/50 px-1.5 py-0.5 text-10 text-green-400">
							{projectConnections.length}
						</span>
					) : null}
				</div>
				<LuChevronDown
					className={cn("size-4 text-gray-400 transition-transform", isExpanded && "rotate-180")}
				/>
			</button>

			{isExpanded ? (
				<div className="px-4 pb-4">
					{projectConnections.length > 0 ? (
						<div className="mb-3">
							<Typography className="mb-2 text-gray-400" element="span" size="small">
								Project Connections
							</Typography>
							<div className="space-y-2">
								{projectConnections.map((conn) => (
									<DraggableConnection
										connection={conn}
										key={conn.name}
										onDragStart={handleConnectionDragStart}
									/>
								))}
							</div>
						</div>
					) : null}

					<button
						className="flex w-full items-center justify-between rounded-lg border border-dashed border-gray-600 px-3 py-2 text-left transition-colors hover:border-gray-400 hover:bg-gray-900"
						onClick={() => setShowAvailable(!showAvailable)}
						type="button"
					>
						<div className="flex items-center gap-2">
							<LuPlus className="size-4 text-gray-400" />
							<Typography className="text-gray-400" element="span" size="small">
								Add Connection
							</Typography>
						</div>
						<LuChevronDown
							className={cn("size-3 text-gray-500 transition-transform", showAvailable && "rotate-180")}
						/>
					</button>

					{showAvailable ? (
						<div className="mt-3">
							<Typography className="mb-2 text-gray-400" element="span" size="small">
								Available Integrations
							</Typography>
							<div className="grid grid-cols-3 gap-2">
								{availableIntegrations.slice(0, 12).map((integration) => (
									<DraggableIntegration
										integration={integration}
										key={integration.value as Integrations}
										onDragStart={handleIntegrationDragStart}
									/>
								))}
							</div>
							{availableIntegrations.length > 12 ? (
								<Typography className="mt-2 text-center text-gray-500" element="p" size="small">
									+{availableIntegrations.length - 12} more integrations
								</Typography>
							) : null}
						</div>
					) : null}
				</div>
			) : null}
		</div>
	);
};
