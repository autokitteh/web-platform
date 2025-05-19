import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { AutoSizer, InfiniteLoader, List, ListRowProps } from "react-virtualized";

import { defaultSessionsActivitiesPageSize } from "@src/constants";
import { SessionLogType, EventListenerName } from "@src/enums";
import { useVirtualizedList, useEventListener } from "@src/hooks";
import { SessionActivity } from "@src/interfaces/models";
import { cn } from "@src/utilities";

import { Frame } from "@components/atoms";
import { ActivityRow, SingleActivityInfo } from "@components/organisms/deployments/sessions/tabs/activities";

export const ActivityList = () => {
	const { t } = useTranslation("deployments", { keyPrefix: "sessions.viewer" });
	const [selectedActivity, setSelectedActivity] = useState<SessionActivity>();
	const { sessionId } = useParams();
	const [rowHeight, setRowHeight] = useState(60);
	const loadedPagesRef = useRef(0);

	const {
		isRowLoaded,
		items: activities,
		listRef,
		loadMoreRows,
		nextPageToken,
	} = useVirtualizedList<SessionActivity>(SessionLogType.Activity, defaultSessionsActivitiesPageSize);

	const loadNextPage = useCallback(async () => {
		if (loadedPagesRef.current >= 5) return;
		await loadMoreRows();
		loadedPagesRef.current += 1;
	}, [loadMoreRows]);

	useEffect(() => {
		if (!sessionId || !nextPageToken) return;

		loadNextPage();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionId, nextPageToken]);

	useEffect(() => {
		const handleResize = () => {
			setRowHeight(window.innerWidth < 1500 ? 80 : 60);
		};

		handleResize();

		window.addEventListener("resize", handleResize);

		return () => window.removeEventListener("resize", handleResize);
	}, []);

	useEventListener(EventListenerName.selectSessionActivity, (event: CustomEvent<{ activity?: SessionActivity }>) => {
		const activity = event.detail?.activity;
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
		<Frame className="pb-0 mr-3 transition rounded-b-none size-full md:py-0">
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
								overscanRowCount={5}
								ref={(ref) => {
									if (ref) {
										registerChild(ref);
										listRef.current = ref;
									}
								}}
								rowCount={activities.length}
								rowHeight={rowHeight}
								rowRenderer={customRowRenderer}
								scrollToAlignment="start"
								width={width}
							/>
						)}
					</InfiniteLoader>
				)}
			</AutoSizer>

			{!activities.length ? (
				<div className="flex items-center justify-center h-full py-5 text-xl font-semibold">
					{t("noActivitiesFound")}
				</div>
			) : null}
		</Frame>
	);
};
