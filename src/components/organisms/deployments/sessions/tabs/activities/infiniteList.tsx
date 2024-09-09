import React, { useCallback, useEffect, useRef, useState } from "react";

import JsonView from "@uiw/react-json-view";
import { githubDarkTheme } from "@uiw/react-json-view/githubDark";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { AutoSizer, IndexRange, List, ListRowRenderer } from "react-virtualized";

import { ActivityRow } from "./infiniteRow";
import { defaultSessionLogRecordsListRowHeight, minimumSessionLogsRecordsToDisplayFallback } from "@src/constants";
import { convertSessionLogRecordsProtoToActivitiesModel } from "@src/models";
import { useCacheStore } from "@src/store/useCacheStore";
import { SessionActivity } from "@src/types/models";

import { Frame, IconButton, Loader, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ArrowLeft, Close } from "@assets/image/icons";

export const ActivityList = () => {
	const [activity, setActivity] = useState<SessionActivity>();
	const listRef = useRef<List | null>(null);
	const frameRef = useRef<HTMLDivElement>(null);

	const autoSizerClass = activity ? "hidden" : "";
	const { sessionId } = useParams();
	const { t } = useTranslation("deployments", { keyPrefix: "activities" });
	const { displayedSessionId, loadLogs, loading, logs, nextPageToken, reset } = useCacheStore();
	const [activities, setActivities] = useState<SessionActivity[]>([]);
	const [scrollPosition, setScrollPosition] = useState<number>(0);

	const [dimensions, setDimensions] = useState<{ height: number; width: number }>({
		height: 0,
		width: 0,
	});

	const rowRenderer: ListRowRenderer = ({ index, key, style }) => (
		<ActivityRow data={activities[index]} index={index} key={key} setActivity={setActivity} style={style} />
	);

	const loadMoreRows = useCallback(
		async ({ startIndex }: IndexRange, height: number) => {
			if (loading || (!nextPageToken && startIndex !== 0)) {
				return;
			}

			const nextPageSize = Math.round(height / defaultSessionLogRecordsListRowHeight) + 10;
			await loadLogs(sessionId!, nextPageSize);
		},
		[nextPageToken, loading, loadLogs, sessionId]
	);

	useEffect(() => {
		const savedScrollPosition = sessionStorage.getItem(`scrollPosition_${sessionId}`);
		if (savedScrollPosition && listRef.current) {
			listRef.current.scrollToPosition(parseInt(savedScrollPosition, 10));
		}

		if (logs.length && displayedSessionId === sessionId) {
			return;
		}
		reset();
		setActivities([]);
		if (!frameRef?.current?.offsetHeight) {
			loadMoreRows({ startIndex: 0, stopIndex: 0 }, minimumSessionLogsRecordsToDisplayFallback);

			return;
		}

		loadMoreRows({ startIndex: 0, stopIndex: 0 }, frameRef.current.offsetHeight);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const activities = convertSessionLogRecordsProtoToActivitiesModel(logs);
		setActivities(activities);
	}, [logs]);

	const handleItemsRendered = useCallback(
		({ visibleStopIndex }: { visibleStopIndex: number }) => {
			if (visibleStopIndex >= activities.length - 1 && nextPageToken && sessionId) {
				loadLogs(sessionId);
			}
		},
		[activities.length, nextPageToken, loadLogs, sessionId]
	);

	const registerListRef = (ref: List | null) => {
		listRef.current = ref;
	};

	const handleResize = useCallback(({ height, width }: { height: number; width: number }) => {
		setDimensions({ height: height * 0.95, width: width * 0.95 });
	}, []);

	const handleScroll = ({ scrollTop }: { scrollTop: number }) => {
		if (scrollTop !== 0) setScrollPosition(scrollTop);
	};

	useEffect(() => {
		return () => {
			sessionStorage.setItem(`scrollPosition_${sessionId}`, scrollPosition.toString());
		};
	}, [sessionId, scrollPosition]);

	return (
		<Frame className="h-4/5 w-full rounded-b-[0] pb-0 pl-0 transition">
			{activity ? (
				<div className="absolute z-30 h-full w-full">
					<div className="flex items-center">
						<IconButton className="absolute right-0" onClick={() => setActivity(undefined)}>
							<Close fill="white" />
						</IconButton>

						<IconButton
							ariaLabel={t("ariaLabelReturnBack")}
							className="h-8 w-8 p-0 hover:bg-black"
							onClick={() => setActivity(undefined)}
						>
							<ArrowLeft className="h-3 w-3" />
						</IconButton>

						<div className="font-semibold">{activity.functionName}</div>
					</div>

					<div>
						<div className="pl-4">
							<div className="mb-4 mt-8 font-bold">Arguments:</div>

							{activity?.args?.length ? (
								<Table>
									<THead>
										<Tr>
											<Th>Key</Th>
										</Tr>
									</THead>

									<TBody>
										{activity.args.map((argument) => (
											<Tr key={argument}>
												<Td>{argument} </Td>
											</Tr>
										))}
									</TBody>
								</Table>
							) : (
								<div>No arguments found</div>
							)}

							<div className="mb-4 mt-8 font-bold">KW Arguments:</div>

							{activity.kwargs && !!Object.keys(activity.kwargs).length ? (
								<Table>
									<THead>
										<Tr>
											<Th>Key</Th>

											<Th>Value</Th>
										</Tr>
									</THead>

									<TBody>
										{Object.entries(activity.kwargs).map(([key, value]) => (
											<Tr key={key}>
												<Td>{key}</Td>

												<Td>
													{typeof value === "object" ? JSON.stringify(value) : String(value)}
												</Td>
											</Tr>
										))}
									</TBody>
								</Table>
							) : (
								<div>No KW arguments found</div>
							)}

							<div className="mb-4 mt-8 font-bold">Return value:</div>

							{!activity.returnStringValue &&
							!activity.returnBytesValue &&
							!Object.keys(activity.returnJSONValue || {}).length ? (
								<div>No returned value found</div>
							) : null}

							{activity.returnBytesValue ? (
								<Accordion
									className="mb-4"
									title={<div className="font-bold underline">Returned Value</div>}
								>
									<pre className="whitespace-pre-wrap">{activity.returnBytesValue}</pre>
								</Accordion>
							) : null}

							{Object.keys(activity.returnJSONValue || {}).length ? (
								<Accordion
									className="mb-4"
									title={<div className="font-bold underline">Returned Value</div>}
								>
									<JsonView
										className="scrollbar mt-2 max-h-72 overflow-auto"
										style={githubDarkTheme}
										value={activity.returnJSONValue}
									/>
								</Accordion>
							) : null}

							{activity.returnStringValue ? (
								<Accordion
									className="mb-4"
									title={<div className="font-bold underline">Returned Value</div>}
								>
									<pre className="w-4/5 whitespace-pre-wrap break-words">
										{activity.returnStringValue}
									</pre>
								</Accordion>
							) : null}
						</div>
					</div>
				</div>
			) : null}

			{loading && !activities.length ? (
				<Loader isCenter size="xl" />
			) : activities.length ? (
				<AutoSizer className={autoSizerClass} onResize={handleResize}>
					{({ height }) => (
						<List
							className="scrollbar"
							height={dimensions.height || height * 0.8}
							onRowsRendered={({ stopIndex }) =>
								handleItemsRendered({
									visibleStopIndex: stopIndex,
								})
							}
							onScroll={handleScroll}
							ref={(ref) => {
								registerListRef(ref);
							}}
							rowCount={activities.length}
							rowHeight={60}
							rowRenderer={rowRenderer}
							width={dimensions.width || height * 0.8}
						/>
					)}
				</AutoSizer>
			) : (
				<div className="mt-10 text-center text-xl font-semibold">{t("noActivitiesFound")}</div>
			)}
		</Frame>
	);
};
