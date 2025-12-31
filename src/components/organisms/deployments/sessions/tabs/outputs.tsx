import React, { memo, useCallback, useEffect, useRef, useState } from "react";

import { AutoSizer, CellMeasurer, CellMeasurerCache, InfiniteLoader, List, ListRowProps } from "react-virtualized";

import { useVirtualizedList } from "@hooks/useVirtualizedList";
import { EventListenerName, SessionLogType } from "@src/enums";
import { useEventListener } from "@src/hooks";
import { SessionOutputLog } from "@src/interfaces/models";

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
	} = useVirtualizedList<SessionOutputLog>(SessionLogType.Output);
	const [isInitialLoad, setIsInitialLoad] = useState(true);
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
		if (isInitialLoad) {
			setIsInitialLoad(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [outputs]);

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

	return (
		<div className="scrollbar size-full">
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
								overscanRowCount={10}
								ref={(ref) => {
									setListRef(ref);
									registerChild(ref);
								}}
								rowCount={outputs.length}
								rowHeight={cacheRef.current.rowHeight}
								rowRenderer={customRowRenderer}
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
