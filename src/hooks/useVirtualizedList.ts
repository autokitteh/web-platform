import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { defaultSessionLogRecordsListRowHeight, standardScreenHeightFallback } from "@src/constants";
import { SessionLogType } from "@src/enums";
import { VirtualizedListHookResult } from "@src/interfaces/hooks";
import { SessionActivity, SessionOutputLog } from "@src/interfaces/models";
import { SessionActivityData, SessionOutputData } from "@src/interfaces/store";

import { useActivitiesCacheStore, useOutputsCacheStore, useToastStore } from "@store";

export function useVirtualizedList<T extends SessionOutputLog | SessionActivity>(
	type: SessionLogType,
	itemHeight = defaultSessionLogRecordsListRowHeight
): VirtualizedListHookResult<T> {
	const { sessionId } = useParams<{ sessionId: string }>();
	const { t } = useTranslation("deployments", { keyPrefix: "sessions.viewer" });
	const frameRef = useRef<HTMLDivElement>(null);
	const addToast = useToastStore((state) => state.addToast);

	const outputsCacheStore = useOutputsCacheStore();
	const activitiesCacheStore = useActivitiesCacheStore();

	const { loadLogs, loading, sessions } = type === SessionLogType.Output ? outputsCacheStore : activitiesCacheStore;

	const [session, setSession] = useState<SessionOutputData | SessionActivityData>();

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

	const isRowLoaded = useCallback(({ index }: { index: number }): boolean => !!items[index], [items]);

	const shouldLoadMore = useMemo(
		() => !(loading || (session && session.hasLastSessionState && !session.nextPageToken)),
		[loading, session]
	);

	const frameHeight = frameRef.current?.offsetHeight || standardScreenHeightFallback;
	const pageSize = Math.ceil((frameHeight / itemHeight) * 1.5);

	const fetchLogs = async (sessionId: string, pageSize: number, force?: boolean) => {
		const { error } = await loadLogs(sessionId, pageSize, force);

		if (error) {
			addToast({
				message: type === SessionLogType.Output ? t("outputLogsFetchError") : t("activityLogsFetchError"),
				type: "error",
			});
		}
	};

	const loadMoreRows = async () => {
		if (!sessionId || !shouldLoadMore) {
			return;
		}

		fetchLogs(sessionId, pageSize);
	};

	useEffect(() => {
		if (!sessionId) return;
		fetchLogs(sessionId, pageSize, true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionId]);

	return {
		items,
		isRowLoaded,
		loadMoreRows,
		frameRef,
		t,
		loading,
		nextPageToken: session?.nextPageToken || null,
	};
}
