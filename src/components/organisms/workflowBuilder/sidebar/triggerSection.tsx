import React, { DragEvent, useState } from "react";

import { LuChevronDown, LuClock, LuLink, LuZap } from "react-icons/lu";

import { TriggerType } from "@interfaces/components/workflowBuilder.interface";
import { cn } from "@src/utilities";

import { Typography } from "@components/atoms";

interface TriggerItem {
	type: TriggerType;
	label: string;
	description: string;
	icon: React.ElementType;
	color: string;
	bgColor: string;
}

const triggerItems: TriggerItem[] = [
	{
		type: "schedule",
		label: "Schedule",
		description: "Run on a cron schedule",
		icon: LuClock,
		color: "text-amber-400",
		bgColor: "bg-amber-500/20",
	},
	{
		type: "webhook",
		label: "Webhook",
		description: "Triggered by HTTP request",
		icon: LuLink,
		color: "text-purple-400",
		bgColor: "bg-purple-500/20",
	},
	{
		type: "event",
		label: "Event",
		description: "Listen to connection events",
		icon: LuZap,
		color: "text-blue-400",
		bgColor: "bg-blue-500/20",
	},
];

interface DraggableTriggerProps {
	trigger: TriggerItem;
	onDragStart: (event: DragEvent<HTMLDivElement>, trigger: TriggerItem) => void;
}

const DraggableTrigger = ({ trigger, onDragStart }: DraggableTriggerProps) => {
	const Icon = trigger.icon;

	return (
		<div
			className="flex cursor-grab items-center gap-3 rounded-lg border border-gray-750 bg-gray-1000 p-3 transition-all hover:border-gray-500 hover:bg-gray-900 active:cursor-grabbing"
			draggable
			onDragStart={(event) => onDragStart(event, trigger)}
		>
			<div className={cn("flex size-10 items-center justify-center rounded-lg", trigger.bgColor)}>
				<Icon className={cn("size-5", trigger.color)} />
			</div>
			<div className="flex-1">
				<Typography className="font-medium text-white" element="span" size="small">
					{trigger.label}
				</Typography>
				<Typography className="block text-gray-500" element="span" size="small">
					{trigger.description}
				</Typography>
			</div>
		</div>
	);
};

export const TriggerSection = () => {
	const [isExpanded, setIsExpanded] = useState(true);

	const handleDragStart = (event: DragEvent<HTMLDivElement>, trigger: TriggerItem) => {
		const dragData = {
			nodeType: "trigger",
			triggerType: trigger.type,
			label: trigger.label,
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
					<LuZap className="size-4 text-amber-400" />
					<Typography className="font-medium text-white" element="span" size="small">
						Triggers
					</Typography>
				</div>
				<LuChevronDown
					className={cn("size-4 text-gray-400 transition-transform", isExpanded && "rotate-180")}
				/>
			</button>

			{isExpanded ? (
				<div className="space-y-2 px-4 pb-4">
					{triggerItems.map((trigger) => (
						<DraggableTrigger key={trigger.type} onDragStart={handleDragStart} trigger={trigger} />
					))}
				</div>
			) : null}
		</div>
	);
};
