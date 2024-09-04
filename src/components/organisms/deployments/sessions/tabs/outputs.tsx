import React, { LegacyRef, useCallback, useEffect, useRef, useState } from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { AutoSizer, CellMeasurer, CellMeasurerCache, Index, IndexRange, InfiniteLoader, List } from "react-virtualized";

import { SessionsService } from "@services";
import { defaultSessionLogRecordsListRowHeight, minimumSessionLogsRecordsToDisplayFallback } from "@src/constants";
import { convertSessionLogProtoToViewerOutput } from "@src/models";
import { SessionOutput } from "@src/types/models";
import { useToastStore } from "@store/useToastStore";

import { Frame, Loader } from "@components/atoms";

export const SessionOutputs: React.FC = () => {
	const [logs, setLogs] = useState<SessionOutput[]>([]);
	const [nextPageToken, setNextPageToken] = useState<string>();
	const { sessionId } = useParams();
	const addToast = useToastStore((state) => state.addToast);
	const { t } = useTranslation("deployments", { keyPrefix: "sessions" });
	const isLoadingRef = useRef<boolean>(false);
	const listRef = useRef<List | null>(null);
	const frameRef = useRef<HTMLDivElement>(null);

	const [dimensions, setDimensions] = useState<{ height: number; width: number }>({
		height: 0,
		width: 0,
	});

	const cache = new CellMeasurerCache({
		fixedWidth: true,
		defaultHeight: defaultSessionLogRecordsListRowHeight,
	});

	const isRowLoaded = ({ index }: Index) => !!logs[index];

	const loadMoreRows = async ({ startIndex }: IndexRange, height: number) => {
		if (isLoadingRef.current || (!nextPageToken && startIndex !== 0)) {
			return;
		}
		isLoadingRef.current = true;

		try {
			const nextPageSize = Math.round(height / defaultSessionLogRecordsListRowHeight) + 10;

			const { data, error } = await SessionsService.getLogRecordsBySessionId(
				sessionId!,
				nextPageToken,
				nextPageSize
			);
			if (error) {
				addToast({
					id: `error-${Date.now()}`,
					message: t("An error occurred") + `: ${error}`,
					type: "error",
				});
			}
			if (data) {
				const convertedRecords = convertSessionLogProtoToViewerOutput(data.records);
				setLogs((prev) => [...prev, ...convertedRecords]);
				setNextPageToken(data.nextPageToken);
			}
		} catch (error) {
			addToast({
				id: `error-${Date.now()}`,
				message: t("An error occurred") + `: ${error.message}`,
				type: "error",
			});
		} finally {
			isLoadingRef.current = false;
		}
	};

	useEffect(() => {
		setLogs([]);
		if (!frameRef?.current?.offsetHeight) {
			loadMoreRows({ startIndex: 0, stopIndex: 0 }, minimumSessionLogsRecordsToDisplayFallback);

			return;
		}

		loadMoreRows({ startIndex: 0, stopIndex: 0 }, frameRef.current.offsetHeight);

		if (listRef.current) {
			listRef.current.scrollToPosition(0);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionId]);

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
		const log = logs[index] || {};

		return (
			<CellMeasurer cache={cache} columnIndex={0} key={key} parent={parent} rowIndex={index}>
				{({ measure, registerChild }) => (
					<div ref={registerChild as LegacyRef<HTMLDivElement>} style={style}>
						<script onLoad={measure} />

						<div className="flex">
							<div className="w-1/3 text-yellow-500">[{log.time}]: </div>

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
			{isLoadingRef.current ? (
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
							rowCount={nextPageToken ? logs.length + 1 : logs.length}
							threshold={15}
						>
							{({ onRowsRendered, registerChild }) => (
								<List
									deferredMeasurementCache={cache}
									height={dimensions.height} // Use dimensions from state
									onRowsRendered={onRowsRendered}
									overscanRowCount={10}
									ref={(ref) => {
										registerChild(ref);
										registerListRef(ref);
									}}
									rowCount={logs.length}
									rowHeight={cache.rowHeight}
									rowRenderer={rowRenderer}
									width={dimensions.width} // Use dimensions from state
								/>
							)}
						</InfiniteLoader>
					)}
				</AutoSizer>
			)}

			{!logs.length ? (
				<div className="center mt-20 flex flex-col">
					<div className="mt-10 text-center text-xl font-semibold">{t("noLogsFound")}</div>
				</div>
			) : null}
		</Frame>
	);
};
