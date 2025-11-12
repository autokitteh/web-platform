import React from "react";

import { VariableItem } from "@interfaces/components";

import { IconSvg } from "@components/atoms";

import { EnvIcon, LockSolid } from "@assets/image/icons";

interface VariableItemDisplayProps {
	item: VariableItem;
}

export const VariableItemDisplay = ({ item }: VariableItemDisplayProps) => {
	const hasValue = item.varValue && item.varValue.trim() !== "";

	return (
		<span className="flex items-center gap-2">
			<IconSvg className="size-5 stroke-white stroke-[1]" src={EnvIcon} />
			<span className="flex items-center gap-2">
				<span className="min-w-[60px] max-w-[60px] truncate sm:min-w-[70px] sm:max-w-[70px] md:min-w-[80px] md:max-w-[80px] lg:min-w-[85px] lg:max-w-[85px] xl:min-w-[90px] xl:max-w-[90px]">
					{item.name}
				</span>
				<div className="w-[6.8rem] truncate">
					{hasValue ? (
						!item.isSecret ? (
							<span className="text-white">{item.varValue}</span>
						) : (
							<div className="flex items-center gap-2 leading-none">
								<LockSolid className="size-3 fill-white" />
								<span className="pt-2 text-white">**********</span>
							</div>
						)
					) : (
						<span className="text-warning">Not set</span>
					)}
				</div>
			</span>
		</span>
	);
};
