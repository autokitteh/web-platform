import React, { memo } from "react";

import { List, ListRowProps } from "react-virtualized";

import { defaultEventsTableRowHeight } from "@src/constants";
import { BaseEvent } from "@src/types/models";

export const VirtualizedList = memo(
	({
		height,
		rowRenderer,
		sortedEvents,
		width,
	}: {
		height: number;
		rowRenderer: (props: ListRowProps) => React.ReactNode;
		sortedEvents: BaseEvent[];
		width: number;
	}) => (
		<List
			className="scrollbar"
			height={height}
			overscanRowCount={5}
			rowCount={sortedEvents.length}
			rowHeight={defaultEventsTableRowHeight}
			rowRenderer={rowRenderer}
			width={width}
		/>
	)
);

VirtualizedList.displayName = "VirtualizedList";
