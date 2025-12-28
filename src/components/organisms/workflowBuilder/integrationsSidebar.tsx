import React, { DragEvent } from "react";

import { useTranslation } from "react-i18next";

import { fitleredIntegrationsMap, Integrations } from "@src/enums/components";
import { IntegrationSelectOption } from "@src/interfaces/components/forms";

import { IconSvg, Typography } from "@components/atoms";

interface DraggableIntegrationProps {
	integration: IntegrationSelectOption;
	onDragStart: (event: DragEvent<HTMLDivElement>, integration: IntegrationSelectOption) => void;
}

const DraggableIntegration = ({ integration, onDragStart }: DraggableIntegrationProps) => {
	return (
		<div
			className="flex cursor-grab flex-col items-center justify-center gap-2 rounded-lg border border-gray-750 bg-gray-1000 p-3 transition-all hover:border-gray-500 hover:bg-gray-900 active:cursor-grabbing"
			draggable
			onDragStart={(event) => onDragStart(event, integration)}
		>
			<div className="flex size-10 items-center justify-center rounded-full bg-white p-1">
				<IconSvg className="size-7" src={integration.icon} />
			</div>
			<Typography className="text-center text-xs text-gray-300" element="span">
				{integration.label}
			</Typography>
		</div>
	);
};

export const IntegrationsSidebar = () => {
	const { t } = useTranslation("workflowBuilder");

	const integrations = Object.values(fitleredIntegrationsMap).sort((a, b) => a.label.localeCompare(b.label));

	const handleDragStart = (event: DragEvent<HTMLDivElement>, integration: IntegrationSelectOption) => {
		event.dataTransfer.setData("application/reactflow", JSON.stringify(integration));
		event.dataTransfer.effectAllowed = "move";
	};

	return (
		<aside className="flex h-full w-72 flex-col border-r border-gray-750 bg-gray-1100">
			<div className="border-b border-gray-750 p-4">
				<Typography className="text-white" variant="h3">
					{t("sidebar.title")}
				</Typography>
				<Typography className="mt-1 text-gray-400" element="p" size="small">
					{t("sidebar.description")}
				</Typography>
			</div>
			<div className="scrollbar flex-1 overflow-y-auto p-4">
				<div className="grid grid-cols-2 gap-3">
					{integrations.map((integration) => (
						<DraggableIntegration
							integration={integration}
							key={integration.value as Integrations}
							onDragStart={handleDragStart}
						/>
					))}
				</div>
			</div>
		</aside>
	);
};
