import React, { useCallback, useMemo, useState } from "react";

import JsonView from "@uiw/react-json-view";
import { githubDarkTheme } from "@uiw/react-json-view/githubDark";
import { AutoSizer, List, ListRowRenderer } from "react-virtualized";

import { ActivityRow } from "./infiniteRow";
import { SessionActivity } from "@src/types/models";

import { Accordion } from "@components/molecules";

interface ActivityListProps {
	activities: SessionActivity[];
	onItemsRendered: (props: { visibleStartIndex: number; visibleStopIndex: number }) => void;
}

export const ActivityList: React.FC<ActivityListProps> = ({ activities, onItemsRendered }) => {
	const [resizeHeight, setResizeHeight] = useState(0);

	const itemData = useMemo(() => ({ activities }), [activities]);

	const rowRenderer: ListRowRenderer = ({ index, key, style }) => (
		<ActivityRow data={itemData} index={index} key={key} style={style} />
	);

	const handleResize = useCallback(({ height }: { height: number }) => {
		setResizeHeight(height - 20);
	}, []);

	return (
		<div className="h-full w-full">
			<div className="absolute z-30 h-full w-full bg-black">
				<div className="mx-7">
					{/* Arguments */}

					{activities[0]?.args?.length ? (
						<>
							<div className="font-bold">Arguments:</div>
							<div className="mt-2">
								{activities[0].args.map((argument: string, index) => (
									<div key={index}>{argument}</div>
								))}
							</div>
						</>
					) : null}

					{/* KW Arguments */}

					{activities[0].kwargs && !!Object.keys(activities[0].kwargs).length ? (
						<>
							<div className="mt-4 font-bold">KW Arguments:</div>
							<div className="mt-2">
								{Object.entries(activities[0].kwargs).map(([key, value]) => (
									<div key={key}>
										<span className="font-semibold">{key}: </span>

										{typeof value === "object" ? JSON.stringify(value) : String(value)}
									</div>
								))}
							</div>
						</>
					) : null}

					{/* Returned Value */}

					{activities[0].returnValue ? (
						<Accordion className="mt-2" title={<div className="font-bold underline">Returned Value</div>}>
							<JsonView
								className="scrollbar max-h-72 overflow-auto"
								style={githubDarkTheme}
								value={JSON.parse(activities[0].returnValue)}
							/>
						</Accordion>
					) : null}
				</div>
			</div>

			<AutoSizer onResize={handleResize}>
				{({ height, width }) => (
					<List
						className="scrollbar"
						height={resizeHeight || height * 0.9}
						onRowsRendered={({ startIndex, stopIndex }) =>
							onItemsRendered({
								visibleStartIndex: startIndex,
								visibleStopIndex: stopIndex,
							})
						}
						rowCount={activities.length}
						rowHeight={60}
						rowRenderer={rowRenderer}
						width={width}
					/>
				)}
			</AutoSizer>
		</div>
	);
};
