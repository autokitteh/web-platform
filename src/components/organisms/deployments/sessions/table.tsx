import React, { useCallback, useEffect, useMemo, useState } from "react";

import { debounce, isEqual } from "lodash";
import { useTranslation } from "react-i18next";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { ListOnItemsRenderedProps } from "react-window";

import { namespaces } from "@constants";
import { ModalName } from "@enums/components";
import { reverseSessionStateConverter } from "@models/utils";
import { LoggerService, SessionsService } from "@services";
import { useResize } from "@src/hooks";
import { useCacheStore, useModalStore, useToastStore } from "@src/store";
import { DeploymentSession, Session, SessionStateKeyType } from "@type/models";
import { cn } from "@utilities";

import { Button, Frame, Loader, THead, Table, Td, Th, Typography } from "@components/atoms";
import { RefreshButton } from "@components/molecules";
import { SessionsTableFilter } from "@components/organisms/deployments";
import { DeleteSessionModal, SessionsTableList } from "@components/organisms/deployments/sessions";

import { CatImage } from "@assets/image";

export const SessionsTable = () => {
	const [leftSideWidth] = useResize({ direction: "horizontal", initial: 45, max: 75, min: 25 });
	const { t: tErrors } = useTranslation(["errors", "services"]);
	const { t } = useTranslation("deployments", { keyPrefix: "sessions" });
	const { closeModal } = useModalStore();
	const { deploymentId, projectId, sessionId } = useParams();
	const navigate = useNavigate();
	const addToast = useToastStore((state) => state.addToast);

	const [sessions, setSessions] = useState<Session[]>([]);
	const [sessionStateType, setSessionStateType] = useState<number>();
	const [selectedSessionId, setSelectedSessionId] = useState<string>();
	const [sessionsNextPageToken, setSessionsNextPageToken] = useState<string>();
	const [sessionStats, setSessionStats] = useState<DeploymentSession[]>([]);
	const [isLoading, setIsLoading] = useState(false);
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
			const loaderTimeout = setTimeout(() => {
				setIsLoading(true);
			}, 1000);

			const { data, error } = await SessionsService.listByDeploymentId(
				deploymentId!,
				{
					stateType: sessionStateType,
				},
				nextPageToken
			);
			clearTimeout(loaderTimeout);
			setIsLoading(false);

			if (error) {
				addToast({
					message: tErrors("sessionsFetchError"),
					type: "error",
				});
				LoggerService.error(
					namespaces.sessionsService,
					tErrors("sessionsFetchErrorExtended", { error: (error as Error).message })
				);

				return;
			}
			if (!data?.sessions) {
				return;
			}
			setSessions((prevSessions) => {
				if (!nextPageToken || forceRefresh) {
					return data.sessions;
				}

				return [...prevSessions, ...data.sessions];
			});
			setSessionsNextPageToken(data.nextPageToken);
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
				setSessions([]);
				setSessionsNextPageToken(undefined);
				await fetchSessions(undefined, true);
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
		const { error } = await SessionsService.deleteSession(selectedSessionId);
		if (error) {
			addToast({
				message: tErrors("failedRemoveSession"),
				type: "error",
			});

			return;
		}

		addToast({
			message: tErrors("sessionDeletedSuccessfully"),
			type: "success",
		});

		LoggerService.info(
			namespaces.ui.sessionsTable,
			tErrors("sessionDeletedSuccessfullyExtended", { sessionId: selectedSessionId })
		);
		closeModal(ModalName.deleteDeploymentSession);
		closeSessionLog();
		fetchDeployments();
	};

	const resizeClass = useMemo(
		() =>
			cn(
				"resize-handle-horizontal bg-gray-1050 z-0 h-full cursor-ew-resize self-center rounded-none p-0.5 transition hover:bg-gray-750",
				{
					"bg-gray-1100": !sessionId,
				}
			),
		[sessionId]
	);

	return (
		<div className="my-2 flex w-full">
			<div style={{ width: `${leftSideWidth}%` }}>
				<Frame className={frameClass}>
					<div className="flex items-center justify-between gap-2.5">
						<Typography className="text-base" element="h2">
							{t("tableTitle")}
						</Typography>
						<div className="flex flex-wrap items-center justify-between gap-2.5">
							<SessionsTableFilter onChange={handleFilterSessions} sessionStats={sessionStats} />
							<RefreshButton isLoading={isLoading} onRefresh={fetchDeployments} />
						</div>
					</div>

					{sessions.length ? (
						<div className="relative my-6 flex h-full flex-col overflow-hidden">
							<Table className="h-full overflow-y-visible">
								<THead className="rounded-t-14">
									<Th className="justify-between">
										<Td className="w-56 pl-4">{t("table.columns.startTime")}</Td>
										<Td className="w-32">{t("table.columns.status")}</Td>
										<Td className="w-32">{t("table.columns.triggerName")}</Td>
										<Td className="w-32">{t("table.columns.connectionName")}</Td>
										<Td className="w-32">{t("table.columns.actions")}</Td>
									</Th>
								</THead>

								<SessionsTableList
									onItemsRendered={handleItemsRendered}
									onSelectedSessionId={setSelectedSessionId}
									onSessionRemoved={fetchDeployments}
									sessions={sessions}
								/>
							</Table>

							{isLoading ? (
								<div className="absolute bottom-0 z-20 flex h-10 w-full items-center bg-gray-1100">
									<Loader firstColor="light-gray" size="md" />
								</div>
							) : null}
						</div>
					) : (
						<div className="mt-10 text-center text-xl font-semibold">{t("noSessions")}</div>
					)}
				</Frame>
			</div>

			<Button className={resizeClass} />

			<div className="flex bg-black" style={{ width: `${100 - (leftSideWidth as number)}%` }}>
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

			<DeleteSessionModal onDelete={handleRemoveSession} />
		</div>
	);
};
