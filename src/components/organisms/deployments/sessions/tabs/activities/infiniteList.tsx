import React, { useCallback, useMemo, useState } from "react";

import { AutoSizer, InfiniteLoader, List, ListRowProps } from "react-virtualized";

import { SessionLogType } from "@src/enums";
import { useVirtualizedList } from "@src/hooks";
import { SessionActivity } from "@src/types/models";
import { cn } from "@src/utilities";

import { Frame, Loader } from "@components/atoms";
import { ActivityRow, SingleActivityInfo } from "@components/organisms/deployments/sessions/tabs/activities";

export const ActivityList = () => {
	const [selectedActivity, setSelectedActivity] = useState<SessionActivity>();

	const {
		isRowLoaded,
		items: activities,
		listRef,
		loadMoreRows,
		loading,
		nextPageToken,
		t,
	} = useVirtualizedList<SessionActivity>(SessionLogType.Activity, 60);

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

	if (loading && !activities.length) {
		return (
			<Frame className="mr-3 h-4/5 w-full rounded-b-none pb-0 transition">
				<Loader isCenter size="xl" />
			</Frame>
		);
	}

	if (!activities.length) {
		return (
			<Frame className="mr-3 h-4/5 w-full rounded-b-none pb-0 transition">
				<div className="mt-10 text-center text-xl font-semibold">{t("noActivitiesFound")}</div>
			</Frame>
		);
	}

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
								rowHeight={60}
								rowRenderer={customRowRenderer}
								width={width}
							/>
						)}
					</InfiniteLoader>
				)}
			</AutoSizer>
		</Frame>
	);
};
