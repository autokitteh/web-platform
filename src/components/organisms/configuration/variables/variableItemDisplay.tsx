import React from "react";

import { VariableItem } from "@interfaces/components";

import { IconSvg } from "@components/atoms";

import { EnvIcon, LockSolid } from "@assets/image/icons";

interface VariableItemDisplayProps {
	item: VariableItem;
}

export const VariableItemDisplay = ({ item }: VariableItemDisplayProps) => {
	return (
		<div className="flex items-center gap-x-3 truncate">
			<span className="rounded-full bg-white p-1">
				<IconSvg className="stroke-black stroke-[2]" size="sm" src={EnvIcon} />
			</span>
			<div className="truncate">
				{item.name}
				{item?.varValue ? (
					<div className="flex flex-row items-center gap-x-2 text-white" id={`${item.id}-value`}>
						Value:
						{!item?.isSecret ? (
							<span className="truncate text-white">
								<code>{item?.varValue}</code>
							</span>
						) : (
							<div className="flex w-full flex-row items-center truncate">
								<LockSolid className="size-3 fill-white" />
								<div className="ml-2 mt-2 text-white">**********</div>
							</div>
						)}
					</div>
				) : null}
			</div>
		</div>
	);
};
