import React from "react";

import { VariableInfoPopover } from "./variableInfoPopover";
import { VariableItem } from "@interfaces/components";

import { InfoPopover } from "@components/molecules/infoPopover";

interface VariableItemDisplayProps {
	item: VariableItem;
}

export const VariableItemDisplay = ({ item }: VariableItemDisplayProps) => {
	return (
		<div className="flex items-center gap-x-3 truncate">
			<InfoPopover title={`Variable information for "${item.name}"`}>
				<VariableInfoPopover item={item} />
			</InfoPopover>
			<span className="truncate">{item.name}</span>
		</div>
	);
};
