import React from "react";

import { TriggerInfoPopover } from "./triggerInfoPopover";

import { InfoPopover } from "@components/molecules/infoPopover";

interface TriggerItemDisplayProps {
	id: string;
	name: string;
}

export const TriggerItemDisplay = ({ id, name }: TriggerItemDisplayProps) => {
	return (
		<div className="flex items-center gap-x-3 truncate">
			<InfoPopover title={`Trigger information for "${name}"`}>
				<TriggerInfoPopover triggerId={id!} />
			</InfoPopover>
			<span className="truncate">{name}</span>
		</div>
	);
};
