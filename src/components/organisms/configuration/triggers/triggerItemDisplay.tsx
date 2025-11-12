import React from "react";

import { TriggerInfoPopover } from "./triggerInfoPopover";

import { InfoPopover } from "@components/molecules/infoPopover";

interface TriggerItemDisplayProps {
	id: string;
	name: string;
}

export const TriggerItemDisplay = ({ id, name }: TriggerItemDisplayProps) => {
	return (
		<span className="flex w-full items-center gap-2">
			<InfoPopover title={`Trigger information for "${name}"`}>
				<TriggerInfoPopover triggerId={id!} />
			</InfoPopover>
			<span className="flex items-center gap-2">
				<span className="min-w-[60px]">{name}</span>
			</span>
		</span>
	);
};
