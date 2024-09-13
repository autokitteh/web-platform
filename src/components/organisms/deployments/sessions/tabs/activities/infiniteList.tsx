import React, { useState } from "react";

import { AutoSizer, InfiniteLoader, List } from "react-virtualized";

import { useVirtualizedList } from "@src/hooks/useVirtualizedList";
import { convertSessionLogRecordsProtoToActivitiesModel } from "@src/models";
import { SessionActivity } from "@src/types/models";
import { cn } from "@src/utilities";

import { Frame, Loader } from "@components/atoms";
import { ActivityRow, SingleActivityInfo } from "@components/organisms/deployments/sessions/tabs/activities";

export const ActivityList = () => {
	const [selectedActivity, setSelectedActivity] = useState<SessionActivity>();

	const {
		handleResize,
		handleScroll,
		isRowLoaded,
		items: activities,
		listRef,
		loadMoreRows,
		loading,
		nextPageToken,
		t,
	} = useVirtualizedList<SessionActivity>(convertSessionLogRecordsProtoToActivitiesModel, 60);

	const autoSizerClass = cn({ hidden: selectedActivity });

	const rowRenderer = ({ index, key, style }: { index: number; key: string; style: React.CSSProperties }) => (
		<ActivityRow data={activities[index]} index={index} key={key} setActivity={setSelectedActivity} style={style} />
	);

	return (
		<Frame className="mr-3 h-4/5 w-full rounded-b-[0] pb-0 transition">
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
