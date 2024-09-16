import React, { useState } from "react";

import { AutoSizer, InfiniteLoader, List, ListRowProps } from "react-virtualized";

import { SessionLogType } from "@src/enums";
import { useVirtualizedList } from "@src/hooks";
import { SessionActivity } from "@src/types/models";
import { cn } from "@src/utilities";

import { Frame, Loader } from "@components/atoms";
import { ActivityRow, SingleActivityInfo } from "@components/organisms/deployments/sessions/tabs/activities";

export const ActivityList: React.FC = () => {
	const [selectedActivity, setSelectedActivity] = useState<SessionActivity>();

	const customRowRenderer = (props: ListRowProps, activity: SessionActivity) => (
		<ActivityRow
			data={activity}
			index={props.index}
			key={props.key}
			setActivity={setSelectedActivity}
			style={props.style}
		/>
	);

	const {
		handleResize,
		handleScroll,
		isRowLoaded,
		items: activities,
		listRef,
		loadMoreRows,
		loading,
		nextPageToken,
		rowRenderer,
		t,
	} = useVirtualizedList<SessionActivity>(SessionLogType.Activity, 60, customRowRenderer);

	const autoSizerClass = cn({ hidden: selectedActivity });

	return (
		<Frame className="mr-3 h-4/5 w-full rounded-b-none pb-0 transition">
			{selectedActivity ? (
				<SingleActivityInfo activity={selectedActivity} setActivity={setSelectedActivity} />
			) : null}

			{loading && !activities.length ? (
				<Loader isCenter size="xl" />
			) : activities.length ? (
				<AutoSizer className={autoSizerClass} onResize={handleResize}>
					{({ height, width }) => (
						<InfiniteLoader
							isRowLoaded={isRowLoaded}
							loadMoreRows={loadMoreRows}
							rowCount={nextPageToken ? activities.length + 1 : activities.length}
							threshold={15}
						>
							{({ onRowsRendered, registerChild }) => (
								<List
									className="scrollbar"
									height={height}
									onRowsRendered={onRowsRendered}
									onScroll={handleScroll}
									ref={(ref) => {
										registerChild(ref);
										listRef.current = ref;
									}}
									rowCount={activities.length}
									rowHeight={60}
									rowRenderer={rowRenderer}
									width={width}
								/>
							)}
						</InfiniteLoader>
					)}
				</AutoSizer>
			) : (
				<div className="mt-10 text-center text-xl font-semibold">{t("noActivitiesFound")}</div>
			)}
		</Frame>
	);
};
