import React, { memo, useCallback, useEffect, useRef } from "react";

import { AutoSizer, CellMeasurer, CellMeasurerCache, InfiniteLoader, List, ListRowProps } from "react-virtualized";

import { useVirtualizedList } from "@hooks/useVirtualizedList";
import { SessionLogType } from "@src/enums";
import { SessionOutput } from "@src/types/models";

import { Loader } from "@components/atoms";

const OutputRow = memo(({ log, measure }: { log: SessionOutput; measure: () => void }) => {
	const rowRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		measure();
	}, [measure]);

	return (
		<div ref={rowRef}>
			<div className="flex font-mono">
				<div className="mr-3 whitespace-nowrap text-yellow-500">[{log.time}]: </div>

				<div className="w-full whitespace-pre-line">{log.print}</div>
			</div>
		</div>
	);
});

OutputRow.displayName = "OutputRow";

export const SessionOutputs = () => {
	const {
		handleScroll,
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
		})
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

	const setListRef = useCallback((ref: List | null) => {
		listRef.current = ref;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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
									width={width}
								/>
							)}
						</InfiniteLoader>
					)}
				</AutoSizer>
			)}

			{!outputs.length && !loading ? (
				<div className="mt-20 flex flex-col">
					<div className="mt-10 text-center text-xl font-semibold">{t("noLogsFound")}</div>
				</div>
			) : null}
		</div>
	);
};
