import React, { memo, useCallback, useEffect, useRef, useState } from "react";

import {
	AutoSizer,
	CellMeasurer,
	CellMeasurerCache,
	InfiniteLoader,
	List,
	ListRowProps,
	ScrollParams,
} from "react-virtualized";

import { useVirtualizedList } from "@hooks/useVirtualizedList";
import { EventListenerName, SessionLogType } from "@src/enums";
import { useEventListener } from "@src/hooks";
import { SessionOutputLog } from "@src/interfaces/models";
import { useAutoRefreshStore } from "@src/store";

import { NewItemsIndicator } from "@components/molecules";

const bottomThreshold = 0;

const OutputRow = memo(({ log, measure }: { log: SessionOutputLog; measure: () => void }) => {
	const rowRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const timer = setTimeout(() => {
			measure();
		}, 0);

		return () => clearTimeout(timer);
	}, [measure, log]);

	return (
		<div className="mb-1" ref={rowRef}>
			<div className="flex font-fira-code">
				<div className="mr-5 whitespace-nowrap text-gray-1550">[{log.time}]: </div>
				<div className="scrollbar-visible w-full overflow-x-auto whitespace-pre-wrap">{log.print}</div>
			</div>
		</div>
	);
});

OutputRow.displayName = "OutputRow";

export const SessionOutputs = () => {
	const {
		isRowLoaded,
		items: outputs,
		listRef,
		loadMoreRows,
		nextPageToken,
		t,
		loading,
		reloadLogs,
		sessionId,
	} = useVirtualizedList<SessionOutputLog>(SessionLogType.Output);

	const [isInitialLoad, setIsInitialLoad] = useState(true);
	const [newLogsCount, setNewLogsCount] = useState(0);
	const prevOutputsLengthRef = useRef(0);
	const countBeforeRefreshRef = useRef(0);
	const scrollTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
	const pendingScrollToBottomRef = useRef(false);

	useEffect(() => {
		const scrollTimeouts = scrollTimeoutsRef.current;

		return () => {
			scrollTimeouts.forEach(clearTimeout);
		};
	}, [scrollTimeoutsRef]);

	const { setLogsAtBottom, getLogsAtBottom, clearLogsBuffer } = useAutoRefreshStore();

	const isAtBottom = sessionId ? getLogsAtBottom(sessionId) : true;

	useEffect(() => {
		setIsInitialLoad(true);
		setNewLogsCount(0);
		prevOutputsLengthRef.current = 0;
		countBeforeRefreshRef.current = 0;
		cacheRef.current.clearAll();
		if (sessionId) {
			clearLogsBuffer(sessionId);
		}
	}, [sessionId, clearLogsBuffer]);

	const cacheRef = useRef(
		new CellMeasurerCache({
			fixedWidth: true,
			minHeight: 22,
			defaultHeight: 44,
			keyMapper: (index) => index,
		})
	);

	useEffect(() => {
		if (listRef.current) {
			cacheRef.current.clearAll();
			listRef.current.recomputeRowHeights();
		}

		const scrollToEnd = () => listRef.current?.scrollToRow(outputs.length - 1);

		if (pendingScrollToBottomRef.current && outputs.length > 0) {
			pendingScrollToBottomRef.current = false;

			scrollToEnd();
			scrollToEnd();
			scrollTimeoutsRef.current.push(setTimeout(scrollToEnd, 50));
			scrollTimeoutsRef.current.push(setTimeout(scrollToEnd, 150));
			prevOutputsLengthRef.current = outputs.length;
			countBeforeRefreshRef.current = outputs.length;
			setNewLogsCount(0);

			return;
		}

		if (isInitialLoad && outputs.length > 0) {
			setIsInitialLoad(false);

			scrollToEnd();
			scrollToEnd();
			scrollTimeoutsRef.current.push(setTimeout(scrollToEnd, 50));
			scrollTimeoutsRef.current.push(setTimeout(scrollToEnd, 150));
			prevOutputsLengthRef.current = outputs.length;
			countBeforeRefreshRef.current = outputs.length;

			return;
		}

		if (isAtBottom && outputs.length > 0) {
			scrollToEnd();
			scrollToEnd();
			scrollTimeoutsRef.current.push(setTimeout(scrollToEnd, 50));
			scrollTimeoutsRef.current.push(setTimeout(scrollToEnd, 150));

			countBeforeRefreshRef.current = outputs.length;
			setNewLogsCount(0);
		}
		prevOutputsLengthRef.current = outputs.length;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [outputs, sessionId]);

	const handleScroll = useCallback(
		({ scrollHeight, scrollTop, clientHeight }: ScrollParams) => {
			if (!sessionId) return;

			const distanceFromBottom = scrollHeight - clientHeight - scrollTop;
			const newIsAtBottom = distanceFromBottom <= bottomThreshold;

			setLogsAtBottom(sessionId, newIsAtBottom);

			if (newIsAtBottom) {
				countBeforeRefreshRef.current = outputs.length;
				setNewLogsCount(0);
			}
		},
		[sessionId, setLogsAtBottom, outputs.length]
	);

	const scrollToBottom = useCallback(async () => {
		if (!sessionId) return;

		setLogsAtBottom(sessionId, true);
		setNewLogsCount(0);

		if (newLogsCount > 0) {
			countBeforeRefreshRef.current = outputs.length;
			pendingScrollToBottomRef.current = true;
			await reloadLogs();
			clearLogsBuffer(sessionId);
		} else {
			const scrollToEnd = () => listRef.current?.scrollToRow(outputs.length - 1);
			scrollToEnd();
			scrollToEnd();
			scrollTimeoutsRef.current.push(setTimeout(scrollToEnd, 50));
			scrollTimeoutsRef.current.push(setTimeout(scrollToEnd, 150));
		}
	}, [sessionId, newLogsCount, reloadLogs, clearLogsBuffer, setLogsAtBottom, listRef, outputs.length]);

	useEventListener(
		EventListenerName.logsNewItemsAvailable,
		(event: CustomEvent<{ count: number; sessionId: string }>) => {
			const currentIsAtBottom = sessionId ? getLogsAtBottom(sessionId) : true;

			if (event.detail?.sessionId === sessionId && !currentIsAtBottom) {
				setNewLogsCount(event.detail.count);
			} else {
				reloadLogs();
			}
		}
	);

	const customRowRenderer = useCallback(
		({ index, key, parent, style }: ListRowProps) => {
			const log = outputs[index];

			return (
				<CellMeasurer cache={cacheRef.current} columnIndex={0} key={key} parent={parent} rowIndex={index}>
					{({ measure, registerChild }) => (
						<div
							ref={(element): void => {
								if (element && registerChild) {
									registerChild(element);
								}
							}}
							style={style}
						>
							<OutputRow log={log} measure={measure} />
						</div>
					)}
				</CellMeasurer>
			);
		},
		[outputs]
	);

	const setListRef = useCallback(
		(ref: List | null) => {
			listRef.current = ref;
		},
		[listRef]
	);

	useEventListener(EventListenerName.sessionLogViewerScrollToTop, () => listRef.current?.scrollToRow(0));

	useEventListener(EventListenerName.sessionReload, () => reloadLogs());

	return (
		<div className="scrollbar relative size-full">
			<NewItemsIndicator
				count={newLogsCount}
				direction="bottom"
				isVisible={Boolean(!isAtBottom && newLogsCount > 0)}
				onJump={scrollToBottom}
			/>
			<AutoSizer>
				{({ height, width }) => (
					<InfiniteLoader
						isRowLoaded={isRowLoaded}
						loadMoreRows={loadMoreRows}
						rowCount={nextPageToken ? outputs.length + 1 : outputs.length}
						threshold={15}
					>
						{({ onRowsRendered, registerChild }) => (
							<List
								className="scrollbar"
								deferredMeasurementCache={cacheRef.current}
								height={height}
								onRowsRendered={onRowsRendered}
								onScroll={handleScroll}
								overscanRowCount={10}
								ref={(ref) => {
									setListRef(ref);
									registerChild(ref);
								}}
								rowCount={outputs.length}
								rowHeight={cacheRef.current.rowHeight}
								rowRenderer={customRowRenderer}
								scrollToAlignment="end"
								width={width}
							/>
						)}
					</InfiniteLoader>
				)}
			</AutoSizer>
			{!outputs.length && !loading ? (
				<div className="flex h-full items-center justify-center py-5 text-xl font-semibold">
					{t("noLogsFound")}
				</div>
			) : null}
		</div>
	);
};
