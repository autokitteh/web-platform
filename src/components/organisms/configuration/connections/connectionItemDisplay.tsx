import React from "react";

import { ConnectionItem } from "@interfaces/components";

import { IconSvg } from "@components/atoms";

interface ConnectionItemDisplayProps {
	item: ConnectionItem;
}

export const ConnectionItemDisplay = ({ item }: ConnectionItemDisplayProps) => {
	return (
		<span className="flex w-full items-center gap-2">
			{item?.icon ? <IconSvg className="rounded-full bg-white p-1" size="md" src={item.icon} /> : null}
			<span className="flex items-center gap-2">
				<span className="min-w-[60px] max-w-[210px] truncate">{item.name}</span>
			</span>
		</span>
	);
};
