import React, { useCallback, useEffect, useId, useMemo, useState } from "react";

import { debounce, isEqual } from "lodash";
import { useTranslation } from "react-i18next";
import { Outlet, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ListOnItemsRenderedProps } from "react-window";

import { defaultSplitFrameSize, namespaces, tourStepsHTMLIds } from "@constants";
import { ModalName } from "@enums/components";
import { reverseSessionStateConverter } from "@models/utils";
import { LoggerService, SessionsService } from "@services";
import { EventListenerName, SessionStateType } from "@src/enums";
import { useResize, triggerEvent } from "@src/hooks";
import { PopoverListItem } from "@src/interfaces/components/popover.interface";
import { Session, SessionStateKeyType } from "@src/interfaces/models";
import { useCacheStore, useModalStore, useSharedBetweenProjectsStore, useToastStore } from "@src/store";
import { SessionStatsFilterType } from "@src/types/components";
import { calculateDeploymentSessionsStats, getShortId, initialSessionCounts } from "@src/utilities";

import { Frame, IconSvg, Loader, ResizeButton, THead, Table, Th, Tr } from "@components/atoms";
import { RefreshButton } from "@components/molecules";
import { PopoverListWrapper, PopoverListContent, PopoverListTrigger } from "@components/molecules/popover/index";
import { SessionsTableFilter } from "@components/organisms/deployments";
import { DeleteSessionModal, SessionsTableList } from "@components/organisms/deployments/sessions";
import { FilterSessionsByEntityPopoverItem } from "@components/organisms/deployments/sessions/table/filters";

import { CatImage } from "@assets/image";
import { FilterIcon } from "@assets/image/icons";

export const SessionsTable = () => {
	const resizeId = useId();
	const { t: tErrors } = useTranslation(["errors", "services"]);
	const { t } = useTranslation("deployments", { keyPrefix: "sessions" });
	const { closeModal } = useModalStore();
	const { deploymentId, projectId, sessionId } = useParams();
	const navigate = useNavigate();
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
	const [popoverDeploymentItems, setPopoverDeploymentItems] = useState<Array<PopoverListItem>>([]);
	const frameClass = "size-full bg-gray-1100 pb-3 pl-7 transition-all rounded-r-none";
	const filteredEntityId = deploymentId || projectId!;
	const [searchParams, setSearchParams] = useSearchParams();
	const { splitScreenRatio, setEditorWidth } = useSharedBetweenProjectsStore();
	const [leftSideWidth] = useResize({
		direction: "horizontal",
		...defaultSplitFrameSize,
		initial: splitScreenRatio[projectId!]?.sessions || defaultSplitFrameSize.initial,
		value: splitScreenRatio[projectId!]?.sessions,
		id: resizeId,
		onChange: (width) => setEditorWidth(projectId!, { sessions: width }),
	});

	const processStateFilter = (stateFilter?: string | null) => {
		if (!stateFilter) return "";
		if (!(stateFilter in SessionStateType)) {
			searchParams.delete("sessionState");
			setSearchParams(searchParams);
			return "";
		}
		return stateFilter ? stateFilter : "";
	};

	const urlSessionStateFilter = processStateFilter(searchParams.get("sessionState")) as SessionStateType;

	const navigateInSessions = (enitityFilter: string, sessionId: string, stateFilterChanged?: string | null) => {
		const filterByState =
			stateFilterChanged !== undefined ? processStateFilter(stateFilterChanged) : urlSessionStateFilter;

		const filterByEntity = enitityFilter || filteredEntityId;

		const entityURL =
			filterByEntity === projectId
				? `/projects/${projectId}/sessions`
				: `/projects/${projectId}/deployments/${filterByEntity}/sessions`;
		const sessionURL = sessionId ? `/${sessionId}` : "";
		const stateFilterURL = filterByState ? `?sessionState=${filterByState}` : "";

		navigate(`${entityURL}${sessionURL}${stateFilterURL}`);
	};

	const fetchDeployments = useCallback(
		async (force: boolean = true) => {
			if (!projectId) return;

			const fetchedDeployments = await reloadDeploymentsCache(projectId, force);

			const formattedDeployments =
				fetchedDeployments?.map(({ deploymentId, sessionStats }) => {
					const totalSessions = sessionStats?.reduce((acc, curr) => acc + (curr.count || 0), 0) || 0;
					return {
						id: deploymentId,
						label: () => (
							<FilterSessionsByEntityPopoverItem
								entityId={deploymentId}
								totalSessions={totalSessions}
								translationKey="table.filters.byDeploymentId"
							/>
						),
					};
				}) || [];

			const {
				sessionStats: sessionsCountByState,
				totalDeployments,
				totalSessionsCount,
			} = calculateDeploymentSessionsStats(fetchedDeployments || []);

			const allSessionsInProject = () => (
				<FilterSessionsByEntityPopoverItem
					entityId={projectId}
					totalSessions={totalSessionsCount}
					translationKey="table.filters.all"
				/>
			);

			setPopoverDeploymentItems([
				{ id: projectId, label: allSessionsInProject() },
				...formattedDeployments.map((deployment) => ({ ...deployment, label: deployment.label() })),
			]);

			if (deploymentId) {
				const deployment = fetchedDeployments?.find((d) => d.deploymentId === deploymentId);
				if (!deployment) return;
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[projectId, deploymentId]
	);

	const fetchSessions = useCallback(
		async (nextPageToken?: string, forceRefresh = false) => {
			if (!forceRefresh) {
				setIsLoading(true);
			}
			const fetchMethod = deploymentId
				? SessionsService.listByDeploymentId.bind(null, deploymentId!)
				: projectId
					? SessionsService.listByProjectId.bind(null, projectId!)
					: null;

			if (!fetchMethod) {
				setIsLoading(false);

				return;
			}

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

			if (!nextPageToken && data.sessions.length > 0) {
				const pathParts = location.pathname.split("/").filter(Boolean);
				const isSessionPage = pathParts.includes("sessions") && pathParts.at(-1) !== "sessions";
				const isDeploymentsPage =
					location.pathname.endsWith("deployments") || location.pathname.endsWith("deployments/");

				if (isSessionPage || isDeploymentsPage) return;

				const cleanPath = location.pathname.endsWith("/") ? location.pathname.slice(0, -1) : location.pathname;
				navigate(`${cleanPath}/${data.sessions[0].sessionId}`, { replace: true });
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[deploymentId, urlSessionStateFilter, sessionId]
	);

	const debouncedFetchSessions = useMemo(() => debounce(fetchSessions, 100), [fetchSessions]);

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

	useEffect(() => {
		refreshData(true);

		return () => {
			debouncedFetchSessions.cancel();
		};
	}, [refreshData, debouncedFetchSessions, deployments]);

	const closeSessionLog = useCallback(() => {
		navigateInSessions(filteredEntityId, "");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId, deploymentId]);

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
		closeSessionLog();
		fetchDeployments();
	};

	const filterSessionsByEntity = (filterEntityId: string) => {
		if (searchParams.has("sessionState")) {
			searchParams.delete("sessionState");
			setSearchParams(searchParams);
		}
		navigateInSessions(filterEntityId, "");
	};

	const refreshViewer = async (): Promise<void> => {
		refreshData();
		if (!sessionId) return;
		triggerEvent(EventListenerName.sessionReload);
		triggerEvent(EventListenerName.sessionReloadActivity);
	};

	return (
		<div className="mt-1.5 flex w-full flex-1 overflow-y-auto">
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
								onChange={(sessionState) => navigateInSessions("", "", sessionState)}
								selectedState={urlSessionStateFilter}
							/>
							<RefreshButton
								id={tourStepsHTMLIds.sessionsRefresh}
								isLoading={isLoading}
								onRefresh={refreshViewer}
							/>
						</div>
					</div>

					<div className="my-6 flex h-full flex-col pb-5">
						{isInitialLoad ? (
							<div className="flex h-full items-center justify-center">
								<Loader firstColor="light-gray" size="md" />
							</div>
						) : sessions.length ? (
							<Table className="flex h-full overflow-y-visible">
								<THead className="rounded-t-14">
									<Tr className="flex">
										<Th className="w-1/5 min-w-36 pl-4">{t("table.columns.startTime")}</Th>
										<Th className="w-1/5 min-w-20">{t("table.columns.status")}</Th>
										<Th className="w-2/5 min-w-40 pl-2">{t("table.columns.source")}</Th>
										<Th className="w-1/5 min-w-20">{t("table.columns.actions")}</Th>
									</Tr>
								</THead>

								<SessionsTableList
									onItemsRendered={handleItemsRendered}
									onSelectedSessionId={setSelectedSessionId}
									onSessionRemoved={fetchDeployments}
									openSession={(sessionId) => navigateInSessions("", sessionId)}
									sessions={sessions}
								/>
							</Table>
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

			<ResizeButton direction="horizontal" resizeId={resizeId} />

			<div className="flex rounded-r-2xl bg-black" style={{ width: `${100 - (leftSideWidth as number)}%` }}>
				{sessionId ? (
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
