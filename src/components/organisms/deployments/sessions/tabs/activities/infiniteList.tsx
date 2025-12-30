import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import { AutoSizer, InfiniteLoader, List, ListRowProps } from "react-virtualized";

import { defaultSessionsActivitiesPageSize } from "@src/constants";
import { SessionLogType, EventListenerName } from "@src/enums";
import { useVirtualizedList, useEventListener } from "@src/hooks";
import { SessionActivity } from "@src/interfaces/models";
import { useAutoRefreshStore } from "@src/store";
import { cn } from "@src/utilities";

import { Frame } from "@components/atoms";
import { LoadingOverlay, NewItemsIndicator } from "@components/molecules";
import { ActivityRow, SingleActivityInfo } from "@components/organisms/deployments/sessions/tabs/activities";

export const ActivityList = () => {
	const { t } = useTranslation("deployments", { keyPrefix: "sessions.viewer" });
	const [selectedActivity, setSelectedActivity] = useState<SessionActivity>();
	const [rowHeight, setRowHeight] = useState(60);

	const {
		isRowLoaded,
		items: activities,
		listRef,
		loadMoreRows,
		nextPageToken,
		loading: loadingActivities,
		reloadLogs,
		sessionId,
	} = useVirtualizedList<SessionActivity>(SessionLogType.Activity, defaultSessionsActivitiesPageSize);

	const { setActivitiesAtBottom, getActivitiesAtBottom, activitiesBufferBySession, clearActivitiesBuffer } =
		useAutoRefreshStore();
	const [newActivitiesCount, setNewActivitiesCount] = useState(0);

	const isAtBottom = sessionId ? getActivitiesAtBottom(sessionId) : true;

	useEffect(() => {
		setNewActivitiesCount(0);
		if (sessionId) {
			clearActivitiesBuffer(sessionId);
		}
	}, [sessionId, clearActivitiesBuffer]);

	useEffect(() => {
		const handleResize = () => {
			setRowHeight(window.innerWidth < 1500 ? 80 : 60);
		};

		handleResize();

		window.addEventListener("resize", handleResize);

		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const bufferedActivitiesCount = useMemo(() => {
		if (!sessionId) return 0;
		return activitiesBufferBySession[sessionId]?.count || 0;
	}, [sessionId, activitiesBufferBySession]);

	const totalNewActivitiesCount = newActivitiesCount + bufferedActivitiesCount;

	useEventListener(EventListenerName.selectSessionActivity, (event: CustomEvent<{ activity?: SessionActivity }>) => {
		const activity = event.detail?.activity;
		setSelectedActivity(activity);
	});

	useEventListener(
		EventListenerName.activitiesNewItemsAvailable,
		(event: CustomEvent<{ count: number; sessionId: string }>) => {
			if (event.detail?.sessionId === sessionId) {
				setNewActivitiesCount((prev) => prev + event.detail.count);
			}
		}
	);

	useEventListener(EventListenerName.sessionReloadActivity, () => {
		reloadLogs();
	});

	const scrollToBottom = useCallback(async () => {
		if (!sessionId) return;

		if (bufferedActivitiesCount > 0) {
			await reloadLogs();
			clearActivitiesBuffer(sessionId);
		}
		setNewActivitiesCount(0);
		listRef.current?.scrollToRow(activities.length - 1);
		setActivitiesAtBottom(sessionId, true);
	}, [
		sessionId,
		bufferedActivitiesCount,
		reloadLogs,
		clearActivitiesBuffer,
		setActivitiesAtBottom,
		listRef,
		activities.length,
	]);

	const handleScroll = useCallback(
		({
			scrollTop,
			scrollHeight,
			clientHeight,
		}: {
			clientHeight: number;
			scrollHeight: number;
			scrollTop: number;
		}) => {
			if (!sessionId) return;

			const distanceFromBottom = scrollHeight - clientHeight - scrollTop;
			const bottomThreshold = 96;
			const newIsAtBottom = distanceFromBottom <= bottomThreshold;

			setActivitiesAtBottom(sessionId, newIsAtBottom);

			if (newIsAtBottom && newActivitiesCount > 0) {
				setNewActivitiesCount(0);
			}
		},
		[sessionId, setActivitiesAtBottom, newActivitiesCount]
	);

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
		<Frame className="relative mr-3 size-full rounded-b-none pb-0 transition md:py-0">
			{selectedActivity ? (
				<SingleActivityInfo activity={selectedActivity} setActivity={setSelectedActivity} />
			) : null}

			<LoadingOverlay isLoading={loadingActivities} />

			<NewItemsIndicator
				count={totalNewActivitiesCount}
				direction="bottom"
				isVisible={Boolean(!isAtBottom && totalNewActivitiesCount > 0)}
				onJump={scrollToBottom}
			/>

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
								onScroll={handleScroll}
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
								scrollToAlignment="end"
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
