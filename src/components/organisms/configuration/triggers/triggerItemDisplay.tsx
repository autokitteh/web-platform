import React from "react";

import { TriggerInfoPopover } from "./triggerInfoPopover";

import { InfoPopover } from "@components/molecules/infoPopover";

interface TriggerItemDisplayProps {
	id: string;
	name: string;
}

export const TriggerItemDisplay = ({ id, name }: TriggerItemDisplayProps) => {
	return (
		<span className="flex w-full items-center gap-x-3">
			<InfoPopover title={`Trigger information for "${name}"`}>
				<TriggerInfoPopover triggerId={id!} />
			</InfoPopover>
			<span className="flex items-center gap-2">
				<span className="min-w-[60px] truncate sm:max-w-32 lg:max-w-40 xl:max-w-52 2xl:max-w-full">{name}</span>
			</span>
		</span>
	);
};
