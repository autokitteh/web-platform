import React from "react";

import { ConnectionInfoPopover } from "./connectionInfoPopover";
import { ConnectionItemDisplayProps } from "@interfaces/components";

export const ConnectionItemDisplay = ({ item, isOrgConnection = false }: ConnectionItemDisplayProps) => {
	return (
		<div className="flex items-center gap-x-3 truncate">
			<ConnectionInfoPopover connectionId={item.id} icon={item.icon} isOrgConnection={isOrgConnection} />
			<span className="truncate">{item.name}</span>
		</div>
	);
};
