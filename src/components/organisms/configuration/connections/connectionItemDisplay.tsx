import React from "react";

import { ConnectionInfoPopover } from "./connectionInfoPopover";
import { ConnectionItem } from "@interfaces/components";

interface ConnectionItemDisplayProps {
	item: ConnectionItem;
}

export const ConnectionItemDisplay = ({ item }: ConnectionItemDisplayProps) => {
	return (
		<div className="flex items-center gap-x-3 truncate">
			<ConnectionInfoPopover connectionId={item.id} icon={item.icon} />
			<span className="truncate">{item.name}</span>
		</div>
	);
};
