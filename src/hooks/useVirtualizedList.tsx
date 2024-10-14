import React, { useCallback, useEffect, useMemo, useRef } from "react";

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

	const items = useMemo(() => {
		return session
			? ((type === SessionLogType.Output
					? (session as OutputSession).outputs
					: (session as ActivitySession).activities) as T[])
			: [];
	}, [session, type]);

	const { loadLogs, loading, reset } = store;

	const cache = useMemo(
		() =>
			new CellMeasurerCache({
				fixedWidth: true,
				defaultHeight: itemHeight,
			}),
		[itemHeight]
	);

	const isRowLoaded = useCallback(({ index }: { index: number }): boolean => !!items[index], [items]);

	const shouldLoadMore = useMemo(() => !(loading || (session && session.fullyLoaded)), [loading, session]);

	const loadMoreRows = useCallback(async (): Promise<void> => {
		if (!sessionId || !shouldLoadMore) {
			return;
		}
		const frameHeight = frameRef?.current?.offsetHeight || minimumSessionLogsRecordsFrameHeightFallback;

		const pageSize = Math.ceil(frameHeight / itemHeight) * 2;

		await loadLogs(sessionId, pageSize);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionId, shouldLoadMore, loadLogs]);

	useEffect(() => {
		if (!sessionId) return;

		if (!session) {
			reset(sessionId);
			loadMoreRows();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionId]);

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
		cache,
		listRef,
		frameRef,
		t,
		nextPageToken: session?.nextPageToken ?? null,
		rowRenderer,
	};
}
