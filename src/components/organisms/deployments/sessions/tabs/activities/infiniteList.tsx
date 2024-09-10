import React, { useCallback, useEffect, useRef, useState } from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { AutoSizer, IndexRange, List, ListRowRenderer } from "react-virtualized";

import { ActivityRow } from "./infiniteRow";
import { defaultSessionLogRecordsListRowHeight, minimumSessionLogsRecordsToDisplayFallback } from "@src/constants";
import { convertSessionLogRecordsProtoToActivitiesModel } from "@src/models";
import { useCacheStore } from "@src/store/useCacheStore";
import { SessionActivity } from "@src/types/models";

import { Frame, Loader } from "@components/atoms";
import { SingleActivityInfo } from "@components/organisms/deployments/sessions/tabs/activities";

export const ActivityList = () => {
	const [activity, setActivity] = useState<SessionActivity>();
	const listRef = useRef<List | null>(null);
	const frameRef = useRef<HTMLDivElement>(null);

	const autoSizerClass = activity ? "hidden" : "";
	const { sessionId } = useParams();
	const { t } = useTranslation("deployments", { keyPrefix: "activities" });
	const { displayedSessionId, loadLogs, loading, logs, nextPageToken, reset } = useCacheStore();
	const [activities, setActivities] = useState<SessionActivity[]>([]);
	const [scrollPosition, setScrollPosition] = useState<number>(0);

	const [dimensions, setDimensions] = useState<{ height: number; width: number }>({
		height: 0,
		width: 0,
	});

	const rowRenderer: ListRowRenderer = ({ index, key, style }) => (
		<ActivityRow data={activities[index]} index={index} key={key} setActivity={setActivity} style={style} />
	);

	const loadMoreRows = useCallback(
		async ({ startIndex }: IndexRange, height: number) => {
			if (loading || (!nextPageToken && startIndex !== 0)) {
				return;
			}

			const nextPageSize = Math.round(height / defaultSessionLogRecordsListRowHeight) + 10;
			await loadLogs(sessionId!, nextPageSize);
		},
		[nextPageToken, loading, loadLogs, sessionId]
	);

	useEffect(() => {
		const savedScrollPosition = sessionStorage.getItem(`scrollPosition_${sessionId}`);
		if (savedScrollPosition && listRef.current) {
			listRef.current.scrollToPosition(parseInt(savedScrollPosition, 10));
		}

		if (logs.length && displayedSessionId === sessionId) {
			return;
		}
		reset();
		setActivities([]);
		if (!frameRef?.current?.offsetHeight) {
			loadMoreRows({ startIndex: 0, stopIndex: 0 }, minimumSessionLogsRecordsToDisplayFallback);

			return;
		}

		loadMoreRows({ startIndex: 0, stopIndex: 0 }, frameRef.current.offsetHeight);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const activities = convertSessionLogRecordsProtoToActivitiesModel(logs);
		setActivities(activities);
	}, [logs]);

	const handleItemsRendered = useCallback(
		({ visibleStopIndex }: { visibleStopIndex: number }) => {
			if (visibleStopIndex >= activities.length - 1 && nextPageToken && sessionId) {
				loadLogs(sessionId);
			}
		},
		[activities.length, nextPageToken, loadLogs, sessionId]
	);

	const registerListRef = (ref: List | null) => {
		listRef.current = ref;
	};

	const handleResize = useCallback(({ height, width }: { height: number; width: number }) => {
		setDimensions({ height: height * 0.95, width: width * 0.95 });
	}, []);

	const handleScroll = ({ scrollTop }: { scrollTop: number }) => {
		if (scrollTop !== 0) setScrollPosition(scrollTop);
	};

	useEffect(() => {
		return () => {
			sessionStorage.setItem(`scrollPosition_${sessionId}`, scrollPosition.toString());
		};
	}, [sessionId, scrollPosition]);

	return (
		<Frame className="mr-3 h-4/5 w-full rounded-b-[0] pb-0 transition">
			{activity ? <SingleActivityInfo activity={activity} setActivity={setActivity} /> : null}

			{loading && !activities.length ? (
				<Loader isCenter size="xl" />
			) : activities.length ? (
				<AutoSizer className={autoSizerClass} onResize={handleResize}>
					{({ height }) => (
						<List
							className="scrollbar"
							height={dimensions.height || height * 0.8}
							onRowsRendered={({ stopIndex }) =>
								handleItemsRendered({
									visibleStopIndex: stopIndex,
								})
							}
							onScroll={handleScroll}
							ref={(ref) => {
								registerListRef(ref);
							}}
							rowCount={activities.length}
							rowHeight={60}
							rowRenderer={rowRenderer}
							width={dimensions.width || height * 0.8}
						/>
					)}
				</AutoSizer>
			) : (
				<div className="mt-10 text-center text-xl font-semibold">{t("noActivitiesFound")}</div>
			)}
		</Frame>
	);
};
