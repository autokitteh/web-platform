import { CSSProperties } from "react";

import { SessionActivity } from "@src/types/models";

export interface ActivityListProps {
	activities: SessionActivity[];
	onItemsRendered: (props: { visibleStartIndex: number; visibleStopIndex: number }) => void;
}

export interface ActivityRowProps {
	data: { activities: SessionActivity[] };
	index: number;
	style: CSSProperties;
	setActivity: (activity: SessionActivity) => void;
}
