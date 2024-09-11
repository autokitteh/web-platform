import { useCallback, useEffect, useRef, useState } from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { CellMeasurerCache } from "react-virtualized";

import { defaultSessionLogRecordsListRowHeight, minimumSessionLogsRecordsFrameHeightFallback } from "@src/constants";
import { useCacheStore } from "@store/useCacheStore";

export function useVirtualizedList<T>(
	convertDataFunction: (data: any[]) => T[],
	itemHeight: number = defaultSessionLogRecordsListRowHeight
) {
	const { sessionId } = useParams();
	const { t } = useTranslation("deployments", { keyPrefix: "sessions" });
	const listRef = useRef<any>(null);
	const frameRef = useRef<HTMLDivElement>(null);

	const { loadLogs, loading, logs, nextPageToken, reset } = useCacheStore();
	const [items, setItems] = useState<T[]>([]);
	const [scrollPosition, setScrollPosition] = useState<number>(0);
	const [dimensions, setDimensions] = useState<{ height: number; width: number }>({
		height: 0,
		width: 0,
	});

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
		const savedScrollPosition = sessionStorage.getItem(`scrollPosition_${sessionId}`);
		if (savedScrollPosition && listRef.current) {
			listRef.current.scrollToPosition(parseInt(savedScrollPosition, 10));
		}

		reset();
		setItems([]);

		const frameHeight = frameRef?.current?.offsetHeight || minimumSessionLogsRecordsFrameHeightFallback;
		const initialLoadSize = Math.ceil(frameHeight / itemHeight) * 2;

		loadMoreRows({ startIndex: 0, stopIndex: initialLoadSize });
	}, [sessionId, logs.length, reset, loadMoreRows, itemHeight]);

	useEffect(() => {
		const convertedItems = convertDataFunction(logs);
		setItems(convertedItems);
	}, [logs, convertDataFunction]);

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
