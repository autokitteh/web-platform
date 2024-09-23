import React, { useCallback } from "react";

import { AutoSizer, CellMeasurer, InfiniteLoader, List, ListRowProps } from "react-virtualized";

import { useVirtualizedList } from "@hooks/useVirtualizedList";
import { SessionLogType } from "@src/enums";
import { SessionOutput } from "@src/types/models";

import { Loader } from "@components/atoms";

export const SessionOutputs = () => {
	const {
		cache,
		frameRef,
		handleResize,
		isRowLoaded,
		items: outputs,
		listRef,
		loadMoreRows,
		loading,
		nextPageToken,
		t,
	} = useVirtualizedList<SessionOutput>(SessionLogType.Output);

	const customRowRenderer = useCallback(
		(props: ListRowProps) => {
			const log = outputs[props.index];

			return (
				<CellMeasurer
					cache={cache}
					columnIndex={0}
					key={props.key}
					parent={props.parent}
					rowIndex={props.index}
				>
					{({ measure, registerChild }) => (
						<div ref={registerChild as React.LegacyRef<HTMLDivElement>} style={props.style}>
							<script onLoad={measure} />

							<div className="flex">
								<div className="w-52 text-yellow-500">[{log.time}]: </div>

								<div className="w-full whitespace-pre-line">{log.print}</div>
							</div>
						</div>
					)}
				</CellMeasurer>
			);
		},
		[cache, outputs]
	);

	return (
		<div className="scrollbar size-full" ref={frameRef}>
			{loading && !outputs.length ? (
				<Loader isCenter size="xl" />
			) : (
				<AutoSizer onResize={handleResize}>
					{({ height, width }) => (
						<InfiniteLoader
							className="scrollbar"
							isRowLoaded={isRowLoaded}
							loadMoreRows={loadMoreRows}
							rowCount={nextPageToken ? outputs.length + 1 : outputs.length}
							threshold={15}
						>
							{({ onRowsRendered, registerChild }) => (
								<List
									deferredMeasurementCache={cache}
									height={height}
									onRowsRendered={onRowsRendered}
									overscanRowCount={10}
									ref={(ref) => {
										if (ref) {
											listRef.current = ref;
											registerChild(ref);
										}
									}}
									rowCount={outputs.length}
									rowHeight={cache.rowHeight}
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
