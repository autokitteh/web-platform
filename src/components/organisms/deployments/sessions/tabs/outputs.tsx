import React from "react";

import { AutoSizer, CellMeasurer, InfiniteLoader, List } from "react-virtualized";

import { useVirtualizedList } from "@hooks/useVirtualizedList";
import { SessionOutput } from "@src/types/models";

import { Loader } from "@components/atoms";

export const SessionOutputs = () => {
	const {
		cache,
		frameRef,
		handleResize,
		handleScroll,
		isRowLoaded,
		items: outputs,
		listRef,
		loadMoreRows,
		loading,
		nextPageToken,
		t,
	} = useVirtualizedList("outputs");

	const rowRenderer = ({
		index,
		key,
		parent,
		style,
	}: {
		index: number;
		key: string;
		parent: any;
		style: React.CSSProperties;
	}) => {
		const log = (outputs[index] as SessionOutput) || {};

		return (
			<CellMeasurer cache={cache} columnIndex={0} key={key} parent={parent} rowIndex={index}>
				{({ measure, registerChild }) => (
					<div ref={registerChild as React.LegacyRef<HTMLDivElement>} style={style}>
						<script onLoad={measure} />

						<div className="flex">
							<div className="w-52 text-yellow-500">[{log.time}]: </div>

							<div className="w-full whitespace-pre-line">{log.print}</div>
						</div>
					</div>
				)}
			</CellMeasurer>
		);
	};

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
									onScroll={handleScroll}
									overscanRowCount={10}
									ref={(ref) => {
										registerChild(ref);
										listRef.current = ref;
									}}
									rowCount={outputs.length}
									rowHeight={cache.rowHeight}
									rowRenderer={rowRenderer}
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
