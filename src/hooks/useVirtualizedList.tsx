import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { CellMeasurerCache, List, ListRowProps } from "react-virtualized";

import { defaultSessionLogRecordsListRowHeight, minimumSessionLogsRecordsFrameHeightFallback } from "@src/constants";
import { SessionLogType } from "@src/enums";
import { VirtualizedListHookResult } from "@src/interfaces/hooks";
import { ActivitySession, OutputSession } from "@src/interfaces/store";
import { SessionActivity, SessionOutput } from "@src/types/models";

import { useActivitiesCacheStore, useOutputsCacheStore } from "@store";

export function useVirtualizedList<T extends SessionOutput | SessionActivity>(
	type: SessionLogType,
	itemHeight = defaultSessionLogRecordsListRowHeight,
	customRowRenderer?: (props: ListRowProps, item: T) => React.ReactNode
): VirtualizedListHookResult<T> {
	const { sessionId } = useParams<{ sessionId: string }>();
	const { t } = useTranslation("deployments", { keyPrefix: "sessionAndActivities" });
	const frameRef = useRef<HTMLDivElement>(null);

	const outputsCacheStore = useOutputsCacheStore();
	const activitiesCacheStore = useActivitiesCacheStore();

	const store = type === SessionLogType.Output ? outputsCacheStore : activitiesCacheStore;
	const session = sessionId ? store.sessions[sessionId] : null;
	const listRef = useRef<List | null>(null);
	const [pageSize, setPageSize] = useState(0);

	const items = useMemo(() => {
		return session
			? ((type === SessionLogType.Output
					? (session as OutputSession).outputs
					: (session as ActivitySession).activities) as T[])
			: [];
	}, [session, type]);

	const { loadLogs, loading, reset } = store;

	const [scrollPosition, setScrollPosition] = useState(0);

	const cache = useMemo(
		() =>
			new CellMeasurerCache({
				fixedWidth: true,
				defaultHeight: itemHeight,
			}),
		[itemHeight]
	);

	const isRowLoaded = useCallback(({ index }: { index: number }): boolean => !!items[index], [items]);

	const loadMoreRows = useCallback(async (): Promise<void> => {
		if (!sessionId || loading || (session && session.fullyLoaded)) {
			return Promise.resolve();
		}

		return loadLogs(sessionId, pageSize * 2);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionId, loading, session, loadLogs]);

	const handleScroll = useCallback(({ scrollTop }: { scrollTop: number }): void => {
		if (scrollTop !== 0) setScrollPosition(scrollTop);
	}, []);

	useEffect(() => {
		if (!sessionId) return;

		const savedScrollPosition = sessionStorage.getItem(`scrollPosition_${sessionId}_${type}`);
		if (savedScrollPosition && listRef.current) {
			listRef.current.scrollToPosition(parseInt(savedScrollPosition, 10));
		}

		if (!session) {
			reset(sessionId);
			const frameHeight = frameRef?.current?.offsetHeight || minimumSessionLogsRecordsFrameHeightFallback;
			const initialLoadSize = Math.ceil(frameHeight / itemHeight) * 2;
			setPageSize(initialLoadSize);
			loadMoreRows();
		}
	}, [sessionId, type, session, reset, loadMoreRows, itemHeight]);

	useEffect(() => {
		return () => {
			if (sessionId) {
				sessionStorage.setItem(`scrollPosition_${sessionId}_${type}`, scrollPosition.toString());
			}
		};
	}, [sessionId, type, scrollPosition]);

	const rowRenderer = useCallback(
		(props: ListRowProps): React.ReactNode => {
			const item = items[props.index] as T;

			return customRowRenderer ? (
				customRowRenderer(props, item)
			) : (
				<div key={props.key} style={props.style}>
					{JSON.stringify(item)}
				</div>
			);
		},
		[items, customRowRenderer]
	);

	return {
		items,
		loading,
		isRowLoaded,
		loadMoreRows,
		handleScroll,
		cache,
		listRef,
		frameRef,
		t,
		nextPageToken: session?.nextPageToken ?? null,
		rowRenderer,
	};
}
