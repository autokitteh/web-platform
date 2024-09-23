import React, { useCallback, useEffect, useRef } from "react";

import { AutoSizer, CellMeasurer, CellMeasurerCache, InfiniteLoader, List, ListRowProps } from "react-virtualized";

import { useVirtualizedList } from "@hooks/useVirtualizedList";
import { SessionLogType } from "@src/enums";
import { SessionOutput } from "@src/types/models";

import { Loader } from "@components/atoms";

const OutputRow = React.memo(
	({ log, measure, style }: { log: SessionOutput; measure: () => void; style: React.CSSProperties }) => {
		const rowRef = useRef<HTMLDivElement>(null);

		useEffect(() => {
			measure();
		}, [measure]);

		return (
			<div ref={rowRef} style={style}>
				<div className="flex">
					<div className="w-52 text-yellow-500">[{log.time}]: </div>

					<div className="w-full whitespace-pre-line">{log.print}</div>
				</div>
			</div>
		);
	}
);

OutputRow.displayName = "OutputRow";

export const SessionOutputs = () => {
	const {
		isRowLoaded,
		items: outputs,
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
					{({ measure }) => <OutputRow log={log} measure={measure} style={style} />}
				</CellMeasurer>
			);
		},
		[outputs]
	);

	const listRef = useRef<List | null>(null);

	const setListRef = useCallback((ref: List | null) => {
		listRef.current = ref;
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
