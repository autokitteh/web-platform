import React, { useCallback, useEffect, useRef, useState } from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { AutoSizer, CellMeasurer, CellMeasurerCache, Index, IndexRange, InfiniteLoader, List } from "react-virtualized";

import { defaultSessionLogRecordsListRowHeight, minimumSessionLogsRecordsToDisplayFallback } from "@src/constants";
import { convertSessionLogProtoToViewerOutput } from "@src/models";
import { SessionOutput } from "@src/types/models";
import { useCacheStore } from "@store/useCacheStore";

import { Frame, Loader } from "@components/atoms";

export const SessionOutputs = () => {
	const { sessionId } = useParams();
	const { t } = useTranslation("deployments", { keyPrefix: "sessions" });
	const listRef = useRef<List | null>(null);
	const frameRef = useRef<HTMLDivElement>(null);

	const { loadLogs, loading, logs, nextPageToken, reset } = useCacheStore();
	const [outputs, setOutputs] = useState<SessionOutput[]>([]);

	const [dimensions, setDimensions] = useState<{ height: number; width: number }>({
		height: 0,
		width: 0,
	});

	const cache = new CellMeasurerCache({
		fixedWidth: true,
		defaultHeight: defaultSessionLogRecordsListRowHeight,
	});

	const isRowLoaded = ({ index }: Index) => !!outputs[index];

	const loadMoreRows = useCallback(
		async ({ startIndex }: IndexRange, height: number) => {
			if (loading || (!nextPageToken && startIndex !== 0)) {
				return;
			}

			const nextPageSize = Math.round(height / defaultSessionLogRecordsListRowHeight) + 10;
			await loadLogs(sessionId!, nextPageSize);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[nextPageToken]
	);

	useEffect(() => {
		if (logs.length) {
			return;
		}
		reset();
		setOutputs([]);
		if (!frameRef?.current?.offsetHeight) {
			loadMoreRows({ startIndex: 0, stopIndex: 0 }, minimumSessionLogsRecordsToDisplayFallback);

			return;
		}

		loadMoreRows({ startIndex: 0, stopIndex: 0 }, frameRef.current.offsetHeight);

		if (listRef.current) {
			listRef.current.scrollToPosition(0);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const convertedOutputs = convertSessionLogProtoToViewerOutput(logs);

		setOutputs(convertedOutputs);
	}, [logs]);

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
	}): React.ReactNode => {
		const log = outputs[index] || {};

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

	const registerListRef = (ref: List | null) => {
		listRef.current = ref;
	};

	const handleResize = useCallback(({ height, width }: { height: number; width: number }) => {
		setDimensions({ height: height - 20, width: width - 20 });
	}, []);

	return (
		<Frame className="h-full rounded-b-[0] pb-0 pl-0 transition" ref={frameRef}>
			{loading && !outputs.length ? (
				<Loader isCenter size="xl" />
			) : (
				<AutoSizer onResize={handleResize}>
					{(_) => (
						<InfiniteLoader
							isRowLoaded={isRowLoaded}
							loadMoreRows={({ startIndex, stopIndex }) =>
								loadMoreRows({ startIndex, stopIndex }, dimensions.height)
							}
							minimumBatchSize={10}
							rowCount={nextPageToken ? outputs.length + 1 : outputs.length}
							threshold={15}
						>
							{({ onRowsRendered, registerChild }) => (
								<List
									deferredMeasurementCache={cache}
									height={dimensions.height}
									onRowsRendered={onRowsRendered}
									overscanRowCount={10}
									ref={(ref) => {
										registerChild(ref);
										registerListRef(ref);
									}}
									rowCount={outputs.length}
									rowHeight={cache.rowHeight}
									rowRenderer={rowRenderer}
									width={dimensions.width}
								/>
							)}
						</InfiniteLoader>
					)}
				</AutoSizer>
			)}

			{!outputs.length && !loading ? (
				<div className="center mt-20 flex flex-col">
					<div className="mt-10 text-center text-xl font-semibold">{t("noLogsFound")}</div>
				</div>
			) : null}
		</Frame>
	);
};
