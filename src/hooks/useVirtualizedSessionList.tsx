import { useEffect, useMemo, useRef, useState } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { SessionLogType } from "@src/enums";
import { VirtualizedSessionListHook } from "@src/interfaces/hooks";
import { SessionActivity, SessionOutputLog } from "@src/interfaces/models";
import { SessionActivityData, SessionOutputData } from "@src/interfaces/store";

import { useActivitiesCacheStore, useOutputsCacheStore, useToastStore } from "@store";

export function useVirtualizedSessionList<T extends SessionOutputLog | SessionActivity>(
	type: SessionLogType
): VirtualizedSessionListHook<T> {
	const { sessionId } = useParams<{ sessionId: string }>();
	const { t } = useTranslation("deployments", { keyPrefix: "sessions.viewer" });
	const parentRef = useRef<HTMLDivElement>(null);
	const addToast = useToastStore((state) => state.addToast);

	const outputsCacheStore = useOutputsCacheStore();
	const activitiesCacheStore = useActivitiesCacheStore();

	const { sessions, loadLogs } = type === SessionLogType.Output ? outputsCacheStore : activitiesCacheStore;

	const [session, setSession] = useState<SessionOutputData | SessionActivityData>();

	const items = useMemo(() => {
		return session
			? ((type === SessionLogType.Output
					? (session as SessionOutputData).outputs
					: (session as SessionActivityData).activities) as T[])
			: [];
	}, [session, type]);

	const loading = useMemo(() => !session, [session]);

	useEffect(() => {
		if (sessionId && sessions[sessionId]) {
			setSession(sessions[sessionId]);
		}
	}, [sessionId, sessions]);

	const shouldLoadMore = useMemo(
		() => !(loading || (session && session.hasLastSessionState && !session.nextPageToken)),
		[loading, session]
	);

	const fetchLogs = async (sessionId: string, pageSize: number, force?: boolean) => {
		const { error } = await loadLogs(sessionId, pageSize, force);

		if (error) {
			addToast({
				message: t("fetchLogsError"),
				type: "error",
			});
			return;
		}
	};

	const loadMoreRows = async () => {
		if (!sessionId || !shouldLoadMore || !session?.nextPageToken) {
			return;
		}

		fetchLogs(sessionId, 50);
	};

	useEffect(() => {
		if (!sessionId) return;
		fetchLogs(sessionId, 50, true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionId]);

	const virtualizer = useVirtualizer({
		count: items.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 60,
		overscan: 10,
		measureElement: (element) => element.getBoundingClientRect().height,
	});

	return {
		items,
		loadMoreRows,
		parentRef,
		t,
		loading,
		nextPageToken: session?.nextPageToken || null,
		virtualizer,
	};
}
