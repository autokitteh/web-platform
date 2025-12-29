import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import { debounce, isEqual } from "lodash";
import { useTranslation } from "react-i18next";
import { Outlet, useParams, useSearchParams } from "react-router-dom";
import { ListOnItemsRenderedProps } from "react-window";

import { defaultSessionsTableSplit, namespaces } from "@constants";
import { ModalName } from "@enums/components";
import { reverseSessionStateConverter } from "@models/utils";
import { LoggerService, SessionsService } from "@services";
import { EventListenerName, SessionLogType, SessionStateType } from "@src/enums";
import { triggerEvent, useAutoRefresh, useResize } from "@src/hooks";
import { PopoverListItem } from "@src/interfaces/components/popover.interface";
import { Session, SessionStateKeyType } from "@src/interfaces/models";
import {
	useActivitiesCacheStore,
	useAutoRefreshStore,
	useCacheStore,
	useModalStore,
	useOutputsCacheStore,
	useSharedBetweenProjectsStore,
	useToastStore,
} from "@src/store";
import { SessionStatsFilterType } from "@src/types/components";
import {
	calculateDeploymentSessionsStats,
	getShortId,
	initialSessionCounts,
	UserTrackingUtils,
	useNavigateWithSettings,
} from "@src/utilities";

import { Frame, IconSvg, Loader, ResizeButton, THead, Table, Th, Tr } from "@components/atoms";
import { AutoRefreshIndicator, NewItemsIndicator } from "@components/molecules";
import { PopoverListWrapper, PopoverListContent, PopoverListTrigger } from "@components/molecules/popover/index";
import { SessionsTableFilter } from "@components/organisms/deployments";
import { DeleteSessionModal, SessionsTableList } from "@components/organisms/deployments/sessions";
import { FilterSessionsByEntityPopoverItem } from "@components/organisms/deployments/sessions/table/filters";

import { CatImage } from "@assets/image";
import { FilterIcon } from "@assets/image/icons";

const autoRefreshIntervalMs = 30000;

export const SessionsTable = () => {
	const resizeId = useId();
	const { t: tErrors } = useTranslation(["errors", "services"]);
	const { t } = useTranslation("deployments", { keyPrefix: "sessions" });
	const { closeModal } = useModalStore();
	const { deploymentId, projectId, sessionId: sessionIdFromParams } = useParams();
	const navigateWithSettings = useNavigateWithSettings();
	const addToast = useToastStore((state) => state.addToast);
	const [isDeleting, setIsDeleting] = useState(false);

	const [sessions, setSessions] = useState<Session[]>([]);
	const [selectedSessionId, setSelectedSessionId] = useState<string>();
	const [sessionsNextPageToken, setSessionsNextPageToken] = useState<string>();
	const [sessionStats, setSessionStats] = useState<SessionStatsFilterType>({
		sessionStats: initialSessionCounts,
		totalDeployments: 0,
		totalSessionsCount: 0,
	});
	const [isLoading, setIsLoading] = useState(false);
	const [isInitialLoad, setIsInitialLoad] = useState(true);
	const { fetchDeployments: reloadDeploymentsCache, deployments } = useCacheStore();

	const {
		isSessionsAtTop,
		setSessionsAtTop,
		sessionsBuffer,
		addToSessionsBuffer,
		clearSessionsBuffer,
		addToLogsBuffer,
		getLogsAtBottom,
		addToActivitiesBuffer,
		getActivitiesAtBottom,
	} = useAutoRefreshStore();
	const { sessions: outputsSessions } = useOutputsCacheStore();
	const { sessions: activitiesSessions } = useActivitiesCacheStore();
	const listRef = useRef<{ scrollToTop: () => void } | null>(null);
	const [deploymentItemsData, setDeploymentItemsData] = useState<
		Array<{ id: string; totalSessions: number; translationKey: string }>
	>([]);
	const frameClass = "size-full bg-gray-1100 pb-3 pl-7 transition-all rounded-r-none";
	const filteredEntityId = deploymentId || projectId;
	const [searchParams, setSearchParams] = useSearchParams();
	const { sessionsTableSplit, setSessionsTableWidth, lastSeenSession, setLastSeenSession } =
		useSharedBetweenProjectsStore();
	const [leftSideWidth] = useResize({
		direction: "horizontal",
		...defaultSessionsTableSplit,
		initial: (projectId && sessionsTableSplit[projectId]) || defaultSessionsTableSplit.initial,
		value: projectId ? sessionsTableSplit[projectId] : undefined,
		id: resizeId,
		onChange: (width) => projectId && setSessionsTableWidth(projectId, width),
	});

	const prevDeploymentsRef = useRef(deployments);
	const isFetchingRef = useRef(false);
	const firstTimeLoadingRef = useRef(true);
	const refreshDataRef = useRef<(forceRefresh?: boolean) => Promise<void>>();
	const fetchSessionsRef = useRef<(nextPageToken?: string, forceRefresh?: boolean) => Promise<void>>();
	const debouncedFetchSessionsRef = useRef<ReturnType<typeof debounce<typeof fetchSessions>>>();
	const isCompactMode = leftSideWidth < 25;
	const hideSourceColumn = leftSideWidth < 35;
	const hideActionsColumn = leftSideWidth < 27;

	const popoverDeploymentItems = useMemo<PopoverListItem[]>(
		() =>
			deploymentItemsData.map(({ id, totalSessions, translationKey }) => ({
				id,
				label: (
					<FilterSessionsByEntityPopoverItem
						entityId={id}
						totalSessions={totalSessions}
						translationKey={translationKey}
					/>
				),
			})),
		[deploymentItemsData]
	);

	const processStateFilter = useCallback(
		(stateFilter?: string | null) => {
			if (!stateFilter) return "";
			if (!(stateFilter in SessionStateType)) {
				searchParams.delete("sessionState");
				setSearchParams(searchParams);
				return "";
			}
			return stateFilter ? stateFilter : "";
		},
		[searchParams, setSearchParams]
	);

	const urlSessionStateFilter = processStateFilter(searchParams.get("sessionState")) as SessionStateType;

	const navigateInSessions = useCallback(
		(sessionId: string, stateFilterChanged?: string | null) => {
			const filterByState =
				stateFilterChanged !== undefined ? processStateFilter(stateFilterChanged) : urlSessionStateFilter;

			const stateFilterURL = filterByState ? `?sessionState=${filterByState}` : "";

			let url: string;
			if (sessionId) {
				if (projectId) {
					setLastSeenSession(projectId, sessionId);
				}
				if (deploymentId) {
					url = `/projects/${projectId}/deployments/${deploymentId}/sessions/${sessionId}${stateFilterURL}`;
				} else {
					url = `/projects/${projectId}/sessions/${sessionId}${stateFilterURL}`;
				}
			} else {
				if (deploymentId) {
					url = `/projects/${projectId}/deployments/${deploymentId}/sessions${stateFilterURL}`;
				} else {
					url = `/projects/${projectId}/sessions${stateFilterURL}`;
				}
			}

			navigateWithSettings(url);
		},
		[processStateFilter, urlSessionStateFilter, navigateWithSettings, projectId, deploymentId, setLastSeenSession]
	);

	const fetchDeployments = useCallback(
		async (force: boolean = true) => {
			if (!projectId) return;

			const fetchedDeployments = await reloadDeploymentsCache(projectId, force);

			const formattedDeployments =
				fetchedDeployments?.map(({ deploymentId, sessionStats }) => {
					const totalSessions = sessionStats?.reduce((acc, curr) => acc + (curr.count || 0), 0) || 0;
					return {
						id: deploymentId,
						totalSessions,
						translationKey: "table.filters.byDeploymentId",
					};
				}) || [];

			const {
				sessionStats: sessionsCountByState,
				totalDeployments,
				totalSessionsCount,
			} = calculateDeploymentSessionsStats(fetchedDeployments || []);

			setDeploymentItemsData([
				{ id: projectId, totalSessions: totalSessionsCount, translationKey: "table.filters.all" },
				...formattedDeployments,
			]);

			if (deploymentId) {
				const deployment = fetchedDeployments?.find((d) => d.deploymentId === deploymentId);
				if (!deployment) return;

				UserTrackingUtils.setDeploymentId(deploymentId);
				const deploymentStats = calculateDeploymentSessionsStats([deployment]);
				if (isEqual(deploymentStats.sessionStats, sessionStats.sessionStats)) return;
				setSessionStats(deploymentStats);
				return fetchedDeployments;
			}

			if (isEqual(sessionsCountByState, sessionStats)) return;
			setSessionStats({
				sessionStats: sessionsCountByState,
				totalDeployments,
				totalSessionsCount,
			});
			return fetchedDeployments;
		},
		[projectId, reloadDeploymentsCache, deploymentId, sessionStats]
	);

	const fetchSessions = useCallback(
		async (nextPageToken?: string, forceRefresh = false) => {
			if (!projectId) return;

			if (!forceRefresh) {
				setIsLoading(true);
			}
			const fetchMethod = deploymentId
				? SessionsService.listByDeploymentId.bind(null, deploymentId)
				: SessionsService.listByProjectId.bind(null, projectId);

			const { data, error } = await fetchMethod(
				{
					stateType: reverseSessionStateConverter(urlSessionStateFilter as SessionStateKeyType),
				},
				nextPageToken
			);

			if (error) {
				addToast({
					message: tErrors("sessionsFetchError"),
					type: "error",
				});
				LoggerService.error(
					namespaces.sessionsService,
					tErrors("sessionsFetchErrorExtended", { error: (error as Error).message })
				);

				setIsLoading(false);

				return;
			}

			if (!data?.sessions) {
				setIsLoading(false);

				return;
			}

			setSessions((prevSessions) => {
				if (!nextPageToken || forceRefresh) {
					return data.sessions;
				}

				return [...prevSessions, ...data.sessions];
			});
			setSessionsNextPageToken(data.nextPageToken);
			setIsLoading(false);
			setIsInitialLoad(false);

			if (firstTimeLoadingRef.current && !nextPageToken && data.sessions.length > 0 && !sessionIdFromParams) {
				firstTimeLoadingRef.current = false;

				const rememberedSessionId = lastSeenSession[projectId];
				const sessionToOpen =
					rememberedSessionId && data.sessions.some((s) => s.sessionId === rememberedSessionId)
						? rememberedSessionId
						: data.sessions[0].sessionId;

				navigateWithSettings(`${sessionToOpen}`, { replace: true });
			}
		},
		[
			projectId,
			deploymentId,
			urlSessionStateFilter,
			addToast,
			tErrors,
			lastSeenSession,
			navigateWithSettings,
			sessionIdFromParams,
		]
	);

	const debouncedFetchSessions = useMemo(() => debounce(fetchSessions, 100), [fetchSessions]);
	debouncedFetchSessionsRef.current = debouncedFetchSessions;

	const refreshData = useCallback(
		async (forceRefresh = false) => {
			setIsLoading(true);
			const deploymentsUpdated = await fetchDeployments();

			if (deploymentsUpdated || forceRefresh) {
				await fetchSessions(undefined, true);
				return;
			}

			setIsLoading(false);
		},
		[fetchDeployments, fetchSessions]
	);

	refreshDataRef.current = refreshData;
	fetchSessionsRef.current = fetchSessions;

	const mergeSessions = useCallback(
		(existing: Session[], incoming: Session[]): { addedCount: number; merged: Session[] } => {
			const existingIds = new Set(existing.map((s) => s.sessionId));
			const newSessions = incoming.filter((s) => !existingIds.has(s.sessionId));

			const incomingMap = new Map(incoming.map((s) => [s.sessionId, s]));
			const updatedExisting = existing.map((existingSession) => {
				const incomingSession = incomingMap.get(existingSession.sessionId);
				return incomingSession ? { ...existingSession, ...incomingSession } : existingSession;
			});

			return {
				merged: [...newSessions, ...updatedExisting],
				addedCount: newSessions.length,
			};
		},
		[]
	);

	const handleAutoRefresh = useCallback(async () => {
		if (!projectId || isLoading) return;

		const fetchMethod = deploymentId
			? SessionsService.listByDeploymentId.bind(null, deploymentId)
			: SessionsService.listByProjectId.bind(null, projectId);

		const { data, error } = await fetchMethod(
			{
				stateType: reverseSessionStateConverter(urlSessionStateFilter as SessionStateKeyType),
			},
			undefined
		);

		if (error || !data?.sessions) {
			return;
		}

		const { merged, addedCount } = mergeSessions(sessions, data.sessions);

		const updateExistingSessions = (prev: Session[]) => {
			const incomingMap = new Map(data.sessions.map((s: Session) => [s.sessionId, s]));
			return prev.map((existingSession) => {
				const updated = incomingMap.get(existingSession.sessionId);
				return updated ? { ...existingSession, ...updated } : existingSession;
			});
		};

		if (addedCount === 0) {
			setSessions(updateExistingSessions);
			return;
		}

		if (isSessionsAtTop) {
			setSessions(merged);
			clearSessionsBuffer();
		} else {
			const newSessions = data.sessions.filter(
				(s: Session) => !sessions.some((existing) => existing.sessionId === s.sessionId)
			);
			if (newSessions.length > 0) {
				addToSessionsBuffer(newSessions);
			}
			setSessions(updateExistingSessions);
		}

		fetchDeployments(false);

		if (sessionIdFromParams) {
			const currentOutputs = outputsSessions[sessionIdFromParams]?.outputs || [];
			const currentOutputsCount = currentOutputs.length;

			const { data: newOutputsData } = await SessionsService.getOutputsBySessionId(
				sessionIdFromParams,
				undefined,
				1
			);

			if (newOutputsData?.logs?.length) {
				const latestLog = newOutputsData.logs[0];
				const latestCurrentLog = currentOutputs[currentOutputs.length - 1];

				if (latestLog && latestCurrentLog && latestLog.time !== latestCurrentLog.time) {
					const estimatedNewCount = Math.max(1, newOutputsData.logs.length);
					const isLogsAtBottom = getLogsAtBottom(sessionIdFromParams);
					if (!isLogsAtBottom) {
						addToLogsBuffer(sessionIdFromParams, estimatedNewCount, newOutputsData.nextPageToken || null);
						triggerEvent(EventListenerName.logsNewItemsAvailable, {
							count: estimatedNewCount,
							sessionId: sessionIdFromParams,
						});
					} else {
						triggerEvent(EventListenerName.sessionReload);
					}
				} else if (currentOutputsCount === 0 && newOutputsData.logs.length > 0) {
					triggerEvent(EventListenerName.sessionReload);
				}
			}

			const currentActivities = activitiesSessions[sessionIdFromParams]?.activities || [];
			const currentActivitiesCount = currentActivities.length;

			const { data: newActivitiesData } = await SessionsService.getLogRecordsBySessionId(
				sessionIdFromParams,
				undefined,
				1,
				SessionLogType.Activity
			);

			if (newActivitiesData?.records?.length) {
				const latestCurrentActivity = currentActivities[0];
				const newTotalCount = newActivitiesData.count;

				if (latestCurrentActivity && newTotalCount > currentActivitiesCount) {
					const estimatedNewCount = newTotalCount - currentActivitiesCount;
					const isActivitiesAtBottom = getActivitiesAtBottom(sessionIdFromParams);
					if (!isActivitiesAtBottom) {
						addToActivitiesBuffer(
							sessionIdFromParams,
							estimatedNewCount,
							newActivitiesData.nextPageToken || null
						);
						triggerEvent(EventListenerName.activitiesNewItemsAvailable, {
							count: estimatedNewCount,
							sessionId: sessionIdFromParams,
						});
					} else {
						triggerEvent(EventListenerName.sessionReloadActivity);
					}
				} else if (currentActivitiesCount === 0 && newActivitiesData.records.length > 0) {
					triggerEvent(EventListenerName.sessionReloadActivity);
				}
			}
		} else {
			triggerEvent(EventListenerName.sessionReload);
		}
	}, [
		projectId,
		deploymentId,
		urlSessionStateFilter,
		isLoading,
		sessions,
		isSessionsAtTop,
		mergeSessions,
		addToSessionsBuffer,
		clearSessionsBuffer,
		fetchDeployments,
		sessionIdFromParams,
		outputsSessions,
		getLogsAtBottom,
		addToLogsBuffer,
		activitiesSessions,
		getActivitiesAtBottom,
		addToActivitiesBuffer,
	]);

	const {
		countdownMs,
		isEnabled: isAutoRefreshEnabled,
		isPaused: isAutoRefreshPaused,
		isRefreshing: isAutoRefreshing,
		pause: pauseAutoRefresh,
		refreshNow,
		resume: resumeAutoRefresh,
	} = useAutoRefresh({
		enabled: true,
		intervalMs: autoRefreshIntervalMs,
		onRefresh: handleAutoRefresh,
		pauseWhenHidden: true,
	});

	const showBufferedSessions = useCallback(() => {
		if (sessionsBuffer.count === 0) return;

		const bufferedSessions = sessionsBuffer.sessions;
		setSessions((prev) => {
			const existingIds = new Set(prev.map((s) => s.sessionId));
			const newSessions = bufferedSessions.filter((s) => !existingIds.has(s.sessionId));
			return [...newSessions, ...prev];
		});
		clearSessionsBuffer();
	}, [sessionsBuffer, clearSessionsBuffer]);

	const scrollToTop = useCallback(() => {
		listRef.current?.scrollToTop();
		showBufferedSessions();
	}, [showBufferedSessions]);

	const handleScrollPositionChange = useCallback(
		(atTop: boolean) => {
			setSessionsAtTop(atTop);
			if (atTop && sessionsBuffer.count > 0) {
				showBufferedSessions();
			}
		},
		[setSessionsAtTop, sessionsBuffer.count, showBufferedSessions]
	);

	useEffect(() => {
		const deploymentsChanged = !isEqual(prevDeploymentsRef.current, deployments);
		prevDeploymentsRef.current = deployments;

		if (isFetchingRef.current) {
			return;
		}

		const loadData = async () => {
			isFetchingRef.current = true;
			try {
				if (!deploymentsChanged) {
					await refreshDataRef.current?.(true);
				} else {
					await fetchSessionsRef.current?.(undefined, true);
				}
			} finally {
				isFetchingRef.current = false;
			}
		};

		loadData();

		return () => {
			debouncedFetchSessionsRef.current?.cancel();
		};
	}, [deployments]);

	const closeSessionLog = useCallback(() => {
		navigateInSessions("");
	}, [navigateInSessions]);

	const handleItemsRendered = useCallback(
		({ visibleStopIndex }: ListOnItemsRenderedProps) => {
			if (visibleStopIndex >= sessions.length - 1 && sessionsNextPageToken) {
				debouncedFetchSessions(sessionsNextPageToken);
			}
		},
		[sessions.length, sessionsNextPageToken, debouncedFetchSessions]
	);

	const handleRemoveSession = async () => {
		if (!selectedSessionId) {
			return;
		}
		setIsDeleting(true);
		const { error } = await SessionsService.deleteSession(selectedSessionId);
		setIsDeleting(false);
		if (error) {
			addToast({
				message: tErrors("failedRemoveSession"),
				type: "error",
			});

			return;
		}

		addToast({
			message: t("actions.sessionRemovedSuccessfully"),
			type: "success",
		});

		LoggerService.info(
			namespaces.ui.sessionsTable,
			t("actions.sessionRemovedSuccessfullyExtended", { sessionId: selectedSessionId })
		);

		closeModal(ModalName.deleteDeploymentSession);

		if (selectedSessionId === sessionIdFromParams) {
			const currentIndex = sessions.findIndex((s) => s.sessionId === selectedSessionId);
			const nextSession = sessions[currentIndex + 1] || sessions[currentIndex - 1];

			if (nextSession) {
				navigateInSessions(nextSession.sessionId);
			} else {
				closeSessionLog();
			}
		}

		fetchDeployments();
	};

	const filterSessionsByEntity = (selectedEntityId: string) => {
		if (searchParams.has("sessionState")) {
			searchParams.delete("sessionState");
			setSearchParams(searchParams);
		}

		if (selectedEntityId === projectId) {
			navigateWithSettings(`/projects/${projectId}/sessions`);
		} else {
			navigateWithSettings(`/projects/${projectId}/deployments/${selectedEntityId}/sessions`);
		}
	};

	return (
		<div className="flex size-full flex-1 overflow-y-auto" id="sessions-table">
			<div style={{ width: `${leftSideWidth}%` }}>
				<Frame className={frameClass}>
					<div className="flex items-center">
						<div className="flex items-end">
							<PopoverListWrapper animation="slideFromBottom" interactionType="click">
								<PopoverListTrigger>
									<div className="flex items-center gap-1 whitespace-nowrap border-0 pr-4 text-base text-white hover:bg-transparent">
										<IconSvg className="text-white" size="md" src={FilterIcon} />
										{deploymentId
											? t("table.filters.byDeploymentId", {
													deploymentId: getShortId(deploymentId, 7),
												})
											: t("table.filters.all")}
									</div>
								</PopoverListTrigger>
								<PopoverListContent
									activeId={filteredEntityId}
									className="z-30 flex flex-col rounded-lg border-x border-gray-500 bg-gray-250 p-2"
									displaySearch={popoverDeploymentItems.length > 5}
									emptyListMessage={t("filters.noDeploymentsFound")}
									itemClassName="flex cursor-pointer items-center gap-2.5 rounded-3xl p-2 transition hover:bg-green-200 whitespace-nowrap px-4 text-gray-1100"
									items={popoverDeploymentItems}
									maxItemsToShow={5}
									onItemSelect={({ id }: { id: string }) => filterSessionsByEntity(id)}
								/>
							</PopoverListWrapper>
						</div>
						<div className="ml-auto flex items-center">
							<SessionsTableFilter
								filtersData={sessionStats}
								isCompactMode={isCompactMode}
								onChange={(sessionState) => navigateInSessions(sessionIdFromParams || "", sessionState)}
								selectedState={urlSessionStateFilter}
							/>
							<AutoRefreshIndicator
								className="mr-2"
								countdownMs={countdownMs}
								intervalMs={autoRefreshIntervalMs}
								isEnabled={isAutoRefreshEnabled}
								isPaused={isAutoRefreshPaused}
								isRefreshing={isAutoRefreshing}
								onPause={pauseAutoRefresh}
								onRefreshNow={refreshNow}
								onResume={resumeAutoRefresh}
							/>
						</div>
					</div>

					<div className="my-6 flex h-full flex-col pb-5">
						{isInitialLoad ? (
							<div className="flex h-full items-center justify-center">
								<Loader firstColor="light-gray" size="md" />
							</div>
						) : sessions.length ? (
							<div className="relative flex h-full flex-col">
								<NewItemsIndicator
									count={sessionsBuffer.count}
									direction="top"
									isVisible={Boolean(!isSessionsAtTop && sessionsBuffer.count > 0)}
									onJump={scrollToTop}
									onShow={showBufferedSessions}
								/>
								<Table className="flex h-full overflow-y-visible">
									<THead className="rounded-t-14">
										<Tr className="flex">
											<Th
												className={
													hideSourceColumn ? "w-2/5 min-w-48 pl-4" : "w-1/5 min-w-44 pl-4"
												}
											>
												{t("table.columns.startTime")}
											</Th>
											<Th className="w-1/5 min-w-20 pl-2">{t("table.columns.status")}</Th>
											{!hideSourceColumn ? (
												<Th className="w-2/5 min-w-24 pl-2">{t("table.columns.source")}</Th>
											) : null}
											{!hideActionsColumn ? (
												<Th className="w-1/5 min-w-20">{t("table.columns.actions")}</Th>
											) : null}
										</Tr>
									</THead>

									<SessionsTableList
										hideActionsColumn={hideActionsColumn}
										hideSourceColumn={hideSourceColumn}
										listRef={listRef}
										onItemsRendered={handleItemsRendered}
										onScrollPositionChange={handleScrollPositionChange}
										onSelectedSessionId={setSelectedSessionId}
										onSessionRemoved={fetchDeployments}
										openSession={(sessionId) => navigateInSessions(sessionId)}
										sessions={sessions}
									/>
								</Table>
							</div>
						) : (
							<div className="mt-10 text-center text-xl font-semibold">{t("noSessions")}</div>
						)}

						{isLoading && !isInitialLoad ? (
							<div className="absolute bottom-0 z-20 flex h-10 w-full items-center bg-gray-1100">
								<Loader firstColor="light-gray" size="md" />
							</div>
						) : null}
					</div>
				</Frame>
			</div>

			<ResizeButton direction="horizontal" id="sessions-table-resize-button" resizeId={resizeId} />

			<div
				className="flex overflow-hidden rounded-r-2xl bg-black"
				style={{ width: `${100 - (leftSideWidth as number)}%` }}
			>
				{sessionIdFromParams ? (
					<Outlet />
				) : (
					<Frame className="w-full rounded-l-none bg-gray-1100 pt-20 transition">
						<div className="mt-20 flex flex-col items-center">
							<p className="mb-8 text-lg font-bold text-gray-750">{t("noSelectedSession")}</p>
							<CatImage className="border-b border-gray-750 fill-gray-750" />
						</div>
					</Frame>
				)}
			</div>

			<DeleteSessionModal isDeleting={isDeleting} onDelete={handleRemoveSession} />
		</div>
	);
};
