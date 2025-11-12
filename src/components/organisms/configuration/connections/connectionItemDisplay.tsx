import React from "react";

import { ConnectionItem } from "@interfaces/components";

import { IconSvg } from "@components/atoms";

interface ConnectionItemDisplayProps {
	item: ConnectionItem;
}

export const ConnectionItemDisplay = ({ item }: ConnectionItemDisplayProps) => {
	return (
		<span className="flex w-full items-center gap-x-3">
			{item?.icon ? <IconSvg className="rounded-full bg-white p-0.5" size="lg" src={item.icon} /> : null}
			<span className="flex items-center gap-2">
				<span className="min-w-[60px] truncate">{item.name}</span>
			</span>
		</span>
	);
};
