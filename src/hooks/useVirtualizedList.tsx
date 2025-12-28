import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { CellMeasurerCache, List, ListRowProps } from "react-virtualized";

import { defaultSessionLogRecordsListRowHeight, standardScreenHeightFallback } from "@src/constants";
import { SessionLogType } from "@src/enums";
import { VirtualizedListHookResult } from "@src/interfaces/hooks";
import { SessionActivity, SessionOutputLog } from "@src/interfaces/models";
import { SessionActivityData, SessionOutputData } from "@src/interfaces/store";

import { useActivitiesCacheStore, useOutputsCacheStore, useToastStore } from "@store";

export function useVirtualizedList<T extends SessionOutputLog | SessionActivity>(
	type: SessionLogType,
	itemHeight = defaultSessionLogRecordsListRowHeight,
	customRowRenderer?: (props: ListRowProps, item: T) => React.ReactNode
): VirtualizedListHookResult<T> {
	const { sessionId } = useParams<{ sessionId: string }>();
	const { t } = useTranslation("deployments", { keyPrefix: "sessions.viewer" });
	const frameRef = useRef<HTMLDivElement>(null);
	const addToast = useToastStore((state) => state.addToast);
	const loadingRef = useRef(false);
	const outputsCacheStore = useOutputsCacheStore();
	const activitiesCacheStore = useActivitiesCacheStore();

	const { loadLogs, loading, sessions } = type === SessionLogType.Output ? outputsCacheStore : activitiesCacheStore;
	const { loadAllLogs } = outputsCacheStore;

	const [session, setSession] = useState<SessionOutputData | SessionActivityData>();

	const listRef = useRef<List | null>(null);

	const items = useMemo(() => {
		return session
			? ((type === SessionLogType.Output
					? (session as SessionOutputData).outputs
					: (session as SessionActivityData).activities) as T[])
			: [];
	}, [session, type]);

	useEffect(() => {
		if (!sessionId) return;

		setSession(sessions[sessionId]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessions]);

	const cache = useMemo(
		() =>
			new CellMeasurerCache({
				fixedWidth: true,
				defaultHeight: itemHeight,
			}),
		[itemHeight]
	);

	const isRowLoaded = useCallback(({ index }: { index: number }): boolean => !!items[index], [items]);

	const shouldLoadMore = useMemo(
		() => !(loading || (session && session.hasLastSessionState && !session.nextPageToken)),
		[loading, session]
	);

	const frameHeight = frameRef?.current?.offsetHeight || standardScreenHeightFallback;
	const pageSize = Math.ceil((frameHeight / itemHeight) * 1.5);

	const fetchLogs = useCallback(
		async (sessionId: string, pageSize: number, force?: boolean) => {
			const { error } = await loadLogs(sessionId, pageSize, force);

			if (error) {
				addToast({
					message: type === SessionLogType.Output ? t("outputLogsFetchError") : t("activityLogsFetchError"),
					type: "error",
				});
			}
		},
		[loadLogs, addToast, type, t]
	);

	const loadMoreRows = async () => {
		if (!sessionId || !shouldLoadMore || loadingRef.current) {
			return;
		}

		loadingRef.current = true;
		try {
			await fetchLogs(sessionId, pageSize);
		} finally {
			loadingRef.current = false;
		}
	};

	const fetchAllOutputLogs = useCallback(
		async (sessionId: string) => {
			const { error } = await loadAllLogs(sessionId, pageSize);
			if (error) {
				addToast({
					message: t("outputLogsFetchError"),
					type: "error",
				});
			}
		},
		[loadAllLogs, pageSize, addToast, t]
	);

	useEffect(() => {
		if (!sessionId) return;
		if (type === SessionLogType.Output) {
			fetchAllOutputLogs(sessionId);
		} else {
			fetchLogs(sessionId, pageSize, true);
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

	const reloadLogs = useCallback(async () => {
		if (!sessionId) return;
		await fetchLogs(sessionId, pageSize, true);
	}, [sessionId, fetchLogs, pageSize]);

	return {
		items,
		isRowLoaded,
		loadMoreRows,
		cache,
		listRef,
		frameRef,
		t,
		loading,
		nextPageToken: session?.nextPageToken || null,
		rowRenderer,
		reloadLogs,
		sessionId,
	};
}
