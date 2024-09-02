import React, { LegacyRef, useEffect, useRef, useState } from "react";

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
	const { t } = useTranslation("deployments");
	const isLoadingRef = useRef<boolean>(false);
	const listRef = useRef<List | null>(null); // Use a mutable ref to hold the list instance

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
		if (!document?.getElementById("session-prints")?.offsetHeight) {
			loadMoreRows({ startIndex: 0, stopIndex: 0 }, minimumSessionLogsRecordsToDisplayFallback);

			return;
		}

		loadMoreRows({ startIndex: 0, stopIndex: 0 }, document.getElementById("session-prints")!.offsetHeight);

		if (listRef.current) {
			listRef.current.scrollToPosition(0);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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

							<div className="w-full">{log.print}</div>
						</div>
					</div>
				)}
			</CellMeasurer>
		);
	};

	const registerListRef = (ref: List | null) => {
		listRef.current = ref;
	};

	return (
		<Frame className="h-full pb-0 transition" id="session-prints">
			{isLoadingRef.current ? (
				<Loader isCenter size="xl" />
			) : (
				<AutoSizer>
					{({ height, width }) => (
						<InfiniteLoader
							isRowLoaded={isRowLoaded}
							loadMoreRows={({ startIndex, stopIndex }) =>
								loadMoreRows({ startIndex, stopIndex }, height)
							}
							minimumBatchSize={10}
							rowCount={nextPageToken ? logs.length + 1 : logs.length}
							threshold={15}
						>
							{({ onRowsRendered, registerChild }) => (
								<List
									deferredMeasurementCache={cache}
									height={height}
									onRowsRendered={onRowsRendered}
									overscanRowCount={10}
									ref={(ref) => {
										registerChild(ref); // This ensures the InfiniteLoader gets the List instance
										registerListRef(ref); // Register the list ref using callback
									}}
									rowCount={logs.length}
									rowHeight={cache.rowHeight}
									rowRenderer={rowRenderer}
									width={width}
								/>
							)}
						</InfiniteLoader>
					)}
				</AutoSizer>
			)}

			{!logs.length ? (
				<div className="center mt-20 flex flex-col">
					<p className="mb-8 text-lg font-bold text-gray-750">{t("noData")}</p>
				</div>
			) : null}
		</Frame>
	);
};
