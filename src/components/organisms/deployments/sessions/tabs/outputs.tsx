import React, { memo, useCallback, useEffect, useRef } from "react";

import { AutoSizer, CellMeasurer, CellMeasurerCache, InfiniteLoader, List, ListRowProps } from "react-virtualized";

import { useVirtualizedList } from "@hooks/useVirtualizedList";
import { SessionLogType } from "@src/enums";
import { SessionOutput } from "@src/types/models";

import { Loader } from "@components/atoms";

const OutputRow = memo(({ log, measure }: { log: SessionOutput; measure: () => void }) => {
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
				<div className="w-full whitespace-pre-wrap">{log.print}</div>
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
		loading,
		nextPageToken,
		t,
	} = useVirtualizedList<SessionOutput>(SessionLogType.Output);

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

	return (
		<div className="scrollbar size-full">
			{loading && !outputs.length ? (
				<Loader isCenter size="xl" />
			) : (
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
			)}

			{!outputs.length && !loading ? (
				<div className="flex h-full items-center justify-center py-5 text-xl font-semibold">
					{t("noLogsFound")}
				</div>
			) : null}
		</div>
	);
};
