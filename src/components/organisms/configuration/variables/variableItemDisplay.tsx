import React from "react";

import { VariableItem } from "@interfaces/components";

import { IconSvg } from "@components/atoms";

import { EnvIcon } from "@assets/image/icons";

interface VariableItemDisplayProps {
	item: VariableItem;
}

export const VariableItemDisplay = ({ item }: VariableItemDisplayProps) => {
	return (
		<span className="flex items-center gap-2">
			<IconSvg className="size-5 stroke-white stroke-[1]" src={EnvIcon} />
			<span className="flex items-center gap-2">
				<span className="min-w-[60px] max-w-[210px] truncate">{item.name}</span>
			</span>
		</span>
	);
};
