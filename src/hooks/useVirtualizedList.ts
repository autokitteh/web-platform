import { useCallback, useEffect, useRef, useState } from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { CellMeasurerCache } from "react-virtualized";

import { defaultSessionLogRecordsListRowHeight, minimumSessionLogsRecordsFrameHeightFallback } from "@src/constants";
import { useCacheStore } from "@store/useCacheStore";

export function useVirtualizedList(type: "activities" | "outputs", itemHeight = defaultSessionLogRecordsListRowHeight) {
	const { sessionId } = useParams();
	const { t } = useTranslation("deployments", { keyPrefix: "sessionAndActivities" });
	const listRef = useRef<any>(null);
	const frameRef = useRef<HTMLDivElement>(null);

	const { activities, loadLogs, loading, nextPageToken, outputs, reset } = useCacheStore();
	const [scrollPosition, setScrollPosition] = useState(0);
	const [dimensions, setDimensions] = useState({
		height: 0,
		width: 0,
	});

	const items = type === "activities" ? activities : outputs;

	const cache = new CellMeasurerCache({
		fixedWidth: true,
		defaultHeight: itemHeight,
	});

	const isRowLoaded = useCallback(({ index }: { index: number }) => !!items[index], [items]);

	const loadMoreRows = useCallback(
		async ({ startIndex, stopIndex }: { startIndex: number; stopIndex: number }) => {
			if (loading || (!nextPageToken && startIndex !== 0)) {
				return;
			}

			const pageSize = stopIndex - startIndex + 1;
			await loadLogs(sessionId!, pageSize * 2);
		},
		[loading, loadLogs, nextPageToken, sessionId]
	);

	useEffect(() => {
		const savedScrollPosition = sessionStorage.getItem(`scrollPosition_${sessionId}_${type}`);
		if (savedScrollPosition && listRef.current) {
			listRef.current.scrollToPosition(parseInt(savedScrollPosition, 10));
		}

		reset();

		const frameHeight = frameRef?.current?.offsetHeight || minimumSessionLogsRecordsFrameHeightFallback;
		const initialLoadSize = Math.ceil(frameHeight / itemHeight) * 2;

		loadMoreRows({ startIndex: 0, stopIndex: initialLoadSize });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionId, type]);

	const handleResize = useCallback(({ height, width }: { height: number; width: number }) => {
		setDimensions({ height: height * 0.95, width: width * 0.95 });
	}, []);

	const handleScroll = ({ scrollTop }: { scrollTop: number }) => {
		if (scrollTop !== 0) setScrollPosition(scrollTop);
	};

	useEffect(() => {
		return () => {
			sessionStorage.setItem(`scrollPosition_${sessionId}_${type}`, scrollPosition.toString());
		};
	}, [sessionId, type, scrollPosition]);

	return {
		items,
		loading,
		isRowLoaded,
		loadMoreRows,
		handleResize,
		handleScroll,
		dimensions,
		cache,
		listRef,
		frameRef,
		t,
		nextPageToken,
	};
}
