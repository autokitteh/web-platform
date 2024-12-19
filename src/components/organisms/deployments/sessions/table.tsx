import React, { useCallback, useEffect, useId, useMemo, useState } from "react";

import { debounce, isEqual } from "lodash";
import { useTranslation } from "react-i18next";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { ListOnItemsRenderedProps } from "react-window";

import { namespaces, sessionRowHeight } from "@constants";
import { ModalName } from "@enums/components";
import { reverseSessionStateConverter } from "@models/utils";
import { LoggerService, SessionsService } from "@services";
import { useResize } from "@src/hooks";
import { Session, SessionStateKeyType } from "@src/interfaces/models";
import { useCacheStore, useModalStore, useToastStore } from "@src/store";
import { DeploymentSession } from "@type/models";

import { Frame, Loader, ResizeButton, THead, Table, Th, Tr, Typography } from "@components/atoms";
import { RefreshButton } from "@components/molecules";
import { SessionsTableFilter } from "@components/organisms/deployments";
import { DeleteSessionModal, SessionsTableList } from "@components/organisms/deployments/sessions";

import { CatImage } from "@assets/image";

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
	const [sessionStateType, setSessionStateType] = useState<number>();
	const [selectedSessionId, setSelectedSessionId] = useState<string>();
	const [sessionsNextPageToken, setSessionsNextPageToken] = useState<string>();
	const [sessionStats, setSessionStats] = useState<DeploymentSession[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isInitialLoad, setIsInitialLoad] = useState(true);
	const { fetchDeployments: reloadDeploymentsCache } = useCacheStore();

	const frameClass = "size-full bg-gray-1100 pb-3 pl-7 transition-all rounded-r-none";

	const fetchDeployments = useCallback(async () => {
		if (!projectId) {
			return;
		}

		const deployments = await reloadDeploymentsCache(projectId, true);

		const deployment = deployments?.find((deployment) => deployment.deploymentId === deploymentId);

		if (!deployment?.sessionStats) {
			return;
		}

		if (isEqual(deployment.sessionStats, sessionStats)) {
			return;
		}

		setSessionStats(deployment.sessionStats);

		return deployments;
	}, [projectId, deploymentId, reloadDeploymentsCache, sessionStats]);

	const fetchSessions = useCallback(
		async (nextPageToken?: string, forceRefresh = false) => {
			if (!forceRefresh) {
				setIsLoading(true);
			}

			const { data, error } = await SessionsService.listByDeploymentId(
				deploymentId!,
				{
					stateType: sessionStateType,
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
		[deploymentId, sessionStateType]
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
	}, [sessionStateType, refreshData, debouncedFetchSessions]);

	const closeSessionLog = useCallback(() => {
		navigate(`/projects/${projectId}/deployments/${deploymentId}/sessions`);
	}, [navigate, projectId, deploymentId]);

	const handleFilterSessions = useCallback(
		(stateType?: SessionStateKeyType) => {
			const selectedSessionStateFilter = reverseSessionStateConverter(stateType);
			setSessionStateType(selectedSessionStateFilter);
			closeSessionLog();
		},
		[closeSessionLog]
	);

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

	return (
		<div className="my-1.5 flex w-full flex-1">
			<div style={{ width: `${leftSideWidth}%` }}>
				<Frame className={frameClass}>
					<div className="flex items-center">
						<Typography className="text-base" element="h2">
							{t("tableTitle")}
						</Typography>
						<div className="ml-auto flex items-center">
							<SessionsTableFilter onChange={handleFilterSessions} sessionStats={sessionStats} />
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
