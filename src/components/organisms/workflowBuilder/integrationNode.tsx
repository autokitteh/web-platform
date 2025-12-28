import React, { memo, useCallback, useMemo, useState } from "react";

import { Handle, Position, NodeProps, Node } from "@xyflow/react";
import { LuX } from "react-icons/lu";

import { IntegrationNodeData } from "@interfaces/components/workflowBuilder.interface";
import { ModalName } from "@src/enums";
import { fitleredIntegrationsMap, Integrations } from "@src/enums/components";
import { cn } from "@src/utilities";
import { useModalStore } from "@store/useModalStore";

import { IconSvg, Typography } from "@components/atoms";

type IntegrationNodeProps = NodeProps<Node<IntegrationNodeData, "integration">>;

const IntegrationNodeComponent = ({ id, data }: IntegrationNodeProps) => {
	const [isHovered, setIsHovered] = useState(false);
	const { openModal } = useModalStore();
	const integration = fitleredIntegrationsMap[data.integration as Integrations];
	const icon = integration?.icon;

	const handleDeleteClick = useCallback(
		(event: React.MouseEvent) => {
			event.stopPropagation();
			openModal(ModalName.deleteWorkflowNode, { nodeId: id, nodeName: data.label });
		},
		[id, data.label, openModal]
	);

	const deleteButtonClass = useMemo(
		() =>
			cn(
				"absolute right-1 top-1 flex size-4 cursor-pointer items-center justify-center rounded-full border border-red-500 bg-gray-900 transition-all duration-200",
				isHovered ? "scale-100 opacity-100" : "scale-0 opacity-0"
			),
		[isHovered]
	);

	return (
		<div
			className="relative flex min-w-28 flex-col items-center rounded-lg border border-gray-600 bg-gray-950 p-3 shadow-lg"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<button className={deleteButtonClass} onClick={handleDeleteClick} type="button">
				<LuX className="size-2.5 text-red-500" />
			</button>
			<Handle className="!bg-green-500" id="top" position={Position.Top} type="target" />
			<div className="flex size-12 items-center justify-center rounded-full bg-white p-1">
				{icon ? <IconSvg className="size-9" src={icon} /> : null}
			</div>
			<Typography className="mt-2 text-center text-white" element="span" size="small">
				{data.label}
			</Typography>
			<Handle className="!bg-green-500" id="bottom" position={Position.Bottom} type="source" />
			<Handle className="!bg-green-500" id="left" position={Position.Left} type="target" />
			<Handle className="!bg-green-500" id="right" position={Position.Right} type="source" />
		</div>
	);
};

export const IntegrationNode = memo(IntegrationNodeComponent);
