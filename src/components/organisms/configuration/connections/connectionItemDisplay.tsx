import React from "react";

import { ConnectionItem } from "@interfaces/components";

import { IconSvg } from "@components/atoms";

interface ConnectionItemDisplayProps {
	item: ConnectionItem;
}

export const ConnectionItemDisplay = ({ item }: ConnectionItemDisplayProps) => {
	return (
		<div className="flex items-center gap-x-3 truncate">
			{item?.icon ? (
				<span className="rounded-full bg-white p-1">
					<IconSvg size="sm" src={item.icon} />{" "}
				</span>
			) : null}
			<span className="truncate">{item.name}</span>
		</div>
	);
};
