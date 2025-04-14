import React, { useCallback, useEffect, useMemo, useState } from "react";

import { AutoSizer, InfiniteLoader, List, ListRowProps } from "react-virtualized";

import { SessionLogType, EventListenerName } from "@src/enums";
import { useVirtualizedList, useEventListener } from "@src/hooks";
import { SessionActivity } from "@src/interfaces/models";
import { cn } from "@src/utilities";

import { Frame } from "@components/atoms";
import { ActivityRow, SingleActivityInfo } from "@components/organisms/deployments/sessions/tabs/activities";

export const ActivityList = () => {
	const [selectedActivity, setSelectedActivity] = useState<SessionActivity>();

	const {
		isRowLoaded,
		items: activities,
		listRef,
		loadMoreRows,
		nextPageToken,
		t,
	} = useVirtualizedList<SessionActivity>(SessionLogType.Activity, 60);

	const [rowHeight, setRowHeight] = useState(60);

	useEffect(() => {
		const handleResize = () => {
			setRowHeight(window.innerWidth < 1500 ? 80 : 60);
		};

		handleResize();

		window.addEventListener("resize", handleResize);

		return () => window.removeEventListener("resize", handleResize);
	}, []);

	useEventListener<{ activity: SessionActivity }>(EventListenerName.selectSessionActivity, ({ activity }) => {
		setSelectedActivity(activity);
	});

	const customRowRenderer = useCallback(
		({ index, key, style }: ListRowProps) => (
			<ActivityRow
				data={activities[index]}
				index={index}
				key={key}
				setActivity={setSelectedActivity}
				style={style}
			/>
		),
		[activities, setSelectedActivity]
	);

	const autoSizerClass = useMemo(() => cn({ hidden: selectedActivity }), [selectedActivity]);

	const rowCount = useMemo(
		() => (nextPageToken ? activities.length + 1 : activities.length),
		[activities.length, nextPageToken]
	);

	return (
		<Frame className="mr-3 h-4/5 w-full rounded-b-none pb-0 transition">
			{selectedActivity ? (
				<SingleActivityInfo activity={selectedActivity} setActivity={setSelectedActivity} />
			) : null}

			<AutoSizer className={autoSizerClass}>
				{({ height, width }) => (
					<InfiniteLoader
						isRowLoaded={isRowLoaded}
						loadMoreRows={loadMoreRows}
						rowCount={rowCount}
						threshold={15}
					>
						{({ onRowsRendered, registerChild }) => (
							<List
								className="scrollbar"
								height={height}
								onRowsRendered={onRowsRendered}
								ref={(ref) => {
									if (ref) {
										registerChild(ref);
										listRef.current = ref;
									}
								}}
								rowCount={activities.length}
								rowHeight={rowHeight}
								rowRenderer={customRowRenderer}
								width={width}
							/>
						)}
					</InfiniteLoader>
				)}
			</AutoSizer>

			{!activities.length ? (
				<div className="flex h-full items-center justify-center py-5 text-xl font-semibold">
					{t("noActivitiesFound")}
				</div>
			) : null}
		</Frame>
	);
};
