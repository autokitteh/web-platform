import React from "react";

import { VariableItem } from "@interfaces/components";

import { IconSvg } from "@components/atoms";

import { EnvIcon } from "@assets/image/icons";

interface VariableItemDisplayProps {
	item: VariableItem;
}

export const VariableItemDisplay = ({ item }: VariableItemDisplayProps) => {
	return (
		<span className="flex w-full items-center gap-x-3">
			<IconSvg className="stroke-white stroke-[1]" size="lg" src={EnvIcon} />
			<span className="flex items-center gap-2">
				<span className="min-w-[60px] truncate">{item.name}</span>
			</span>
		</span>
	);
};
