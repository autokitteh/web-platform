/* eslint-disable react/jsx-max-depth */
import React, { useCallback, useEffect, useId, useMemo, useState } from "react";

import { debounce, isEqual } from "lodash";
import { useTranslation } from "react-i18next";
import { Outlet, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ListOnItemsRenderedProps } from "react-window";

import { namespaces, sessionRowHeight } from "@constants";
import { ModalName } from "@enums/components";
import { reverseSessionStateConverter } from "@models/utils";
import { LoggerService, SessionsService } from "@services";
import { SessionStateType } from "@src/enums";
import { useResize } from "@src/hooks";
import { PopoverListItem } from "@src/interfaces/components/popover.interface";
import { Session, SessionStateKeyType } from "@src/interfaces/models";
import { useCacheStore, useModalStore, useToastStore } from "@src/store";
import { calculateDeploymentSessionsStats } from "@src/utilities";
import { DeploymentSession } from "@type/models";

import { Frame, IconSvg, Loader, ResizeButton, THead, Table, Th, Tr } from "@components/atoms";
import { RefreshButton } from "@components/molecules";
import { PopoverList, PopoverListContent, PopoverListTrigger } from "@components/molecules/popover/index";
import { SessionsTableFilter } from "@components/organisms/deployments";
import { DeleteSessionModal, SessionsTableList } from "@components/organisms/deployments/sessions";

import { CatImage } from "@assets/image";
import { FilterIcon } from "@assets/image/icons";

export const SessionsTable = () => {
	const resizeId = useId();
	const [leftSideWidth] = useResize({ direction: "horizontal", initial: 45, max: 75, min: 25, id: resizeId });
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
	const [sessionStats, setSessionStats] = useState<DeploymentSession[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isInitialLoad, setIsInitialLoad] = useState(true);
	const { fetchDeployments: reloadDeploymentsCache } = useCacheStore();
	const [filterValue, setFilterValue] = useState<string>("");
	const [popoverDeploymentItems, setPopoverDeploymentItems] = useState<Array<PopoverListItem>>([]);
	const frameClass = "size-full bg-gray-1100 pb-3 pl-7 transition-all rounded-r-none";
	const filteredEntityId = deploymentId || projectId!;

	const [searchParams, setSearchParams] = useSearchParams();
	const urlSessionStateFilter = useMemo(() => {
		const sessionState = searchParams.get("sessionState");
		if (!sessionState || !(sessionState in SessionStateType)) return;
		return sessionState ? reverseSessionStateConverter(sessionState as SessionStateKeyType) : undefined;
	}, [searchParams]);

	const getShortId = (id: string, suffixLength: number) => {
		if (!id?.length) return "";
		const idPrefix = id.split("_")[0];
		const idSuffix = id.split("_")[1];
		const isValidId = idPrefix?.length > 0 && idSuffix?.length >= suffixLength;
		let shortId = id;
		if (isValidId) {
			const idSuffixEnd = idSuffix.substring(idSuffix.length - suffixLength, idSuffix.length);
			shortId = `${idPrefix}...${idSuffixEnd}`;
		}
		return shortId;
	};

	const filterSessionsByState = (stateType?: SessionStateKeyType) =>
		!stateType
			? navigate(getURLPathForAllSessionsInEntity(filteredEntityId))
			: navigate(`${getURLPathForAllSessionsInEntity(filteredEntityId)}?sessionState=${stateType}`);

	const fetchDeployments = useCallback(async () => {
		if (!projectId) return;

		const fetchedDeployments = await reloadDeploymentsCache(projectId, true);

		const formattedDeployments =
			fetchedDeployments?.map(({ deploymentId }) => {
				return {
					id: deploymentId,
					label: `Deployment: ${getShortId(deploymentId, 7)}`,
				};
			}) || [];

		setPopoverDeploymentItems([{ id: projectId, label: "All Sessions For This Project" }, ...formattedDeployments]);

		if (deploymentId) {
			setFilterValue(deploymentId);
			const deployment = fetchedDeployments?.find((d) => d.deploymentId === deploymentId);
			if (!deployment?.sessionStats) return;
			if (isEqual(deployment.sessionStats, sessionStats)) return;
			setSessionStats(deployment.sessionStats);
			return fetchedDeployments;
		}
		setFilterValue(projectId);

		const { sessionStats: allSessionStats } = calculateDeploymentSessionsStats(fetchedDeployments || []);
		const aggregatedStats = Object.values(allSessionStats);
		if (!aggregatedStats.length || isEqual(aggregatedStats, sessionStats)) return;
		setSessionStats(aggregatedStats as DeploymentSession[]);
		return fetchedDeployments;
	}, [projectId, deploymentId, reloadDeploymentsCache, sessionStats]);

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
					stateType: urlSessionStateFilter,
				},
				nextPageToken,
				sessionRowHeight
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
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[deploymentId, urlSessionStateFilter]
	);

	const debouncedFetchSessions = useMemo(() => debounce(fetchSessions, 100), [fetchSessions]);

	const refreshData = useCallback(
		async (forceRefresh = false) => {
			setIsLoading(true);
			const deploymentsUpdated = await fetchDeployments();

			if (deploymentsUpdated || forceRefresh) {
				await fetchSessions(undefined, true);
			} else {
				setIsLoading(false);
			}
		},
		[fetchDeployments, fetchSessions]
	);

	useEffect(() => {
		refreshData(true);

		return () => {
			debouncedFetchSessions.cancel();
		};
	}, [urlSessionStateFilter, refreshData, debouncedFetchSessions]);

	const closeSessionLog = useCallback(() => {
		navigate(getURLPathForAllSessionsInEntity(filteredEntityId));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId, deploymentId]);

	useEffect(() => {
		const sessionState = searchParams.get("sessionState");
		const validatedState: SessionStateType | undefined =
			sessionState && Object.values(SessionStateType).includes(sessionState as SessionStateType)
				? (sessionState as SessionStateType)
				: undefined;
		if (!validatedState) {
			if (searchParams.has("sessionState")) {
				searchParams.delete("sessionState");
				setSearchParams(searchParams);
			}
		}
		filterSessionsByState(validatedState);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams]);

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

	const getURLPathForAllSessionsInEntity = (entityId: string) =>
		entityId === projectId
			? `/projects/${projectId}/sessions`
			: `/projects/${projectId}/deployments/${entityId}/sessions`;

	const filterSessionsByEntity = (filterEntityId: string) => {
		setFilterValue(filterEntityId);
		if (filterEntityId === projectId) {
			setFilterValue(projectId);
		}

		if (searchParams.has("sessionState")) {
			searchParams.delete("sessionState");
			setSearchParams(searchParams);
		}
		navigate(getURLPathForAllSessionsInEntity(filterEntityId));
	};

	return (
		<div className="mt-1.5 flex w-full flex-1 overflow-y-auto">
			<div style={{ width: `${leftSideWidth}%` }}>
				<Frame className={frameClass}>
					<div className="flex items-center">
						<div className="flex items-end">
							<PopoverList animation="slideFromBottom" interactionType="click">
								<PopoverListTrigger>
									<div className="flex flex-row whitespace-nowrap border-0 pr-4 align-baseline text-white hover:bg-transparent">
										<div className="mr-1 mt-0.5">
											<IconSvg className="text-white" size="md" src={FilterIcon} />
										</div>
										<div className="text-base">
											{deploymentId
												? `Deployment ID: ${getShortId(filterValue, 7)}`
												: "All Sessions For This Project"}
										</div>
									</div>
								</PopoverListTrigger>
								<PopoverListContent
									activeId={filteredEntityId}
									className="z-30 flex flex-col rounded-lg border-x border-gray-500 bg-gray-250 p-2"
									emptyListMessage="No deployments found"
									itemClassName="flex cursor-pointer items-center gap-2.5 rounded-3xl p-2 transition hover:bg-green-200 whitespace-nowrap px-4 text-gray-1100"
									items={popoverDeploymentItems}
									onItemSelect={({ id }: { id: string }) => filterSessionsByEntity(id)}
								/>
							</PopoverList>
						</div>
						<div className="ml-auto flex items-center">
							<SessionsTableFilter
								onChange={(sessionState) => filterSessionsByState(sessionState)}
								selectedState={searchParams.get("sessionState") as SessionStateType}
								sessionStats={sessionStats}
							/>
							<RefreshButton isLoading={isLoading} onRefresh={() => refreshData()} />
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
