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

import { Button, Frame, Loader, THead, Table, Td, Th } from "@components/atoms";
import { RefreshButton } from "@components/molecules";
import { SessionsTableFilter } from "@components/organisms/deployments";
import { DeleteSessionModal, SessionsTableList } from "@components/organisms/deployments/sessions";

import { CatImage } from "@assets/image";

export const SessionsTable = () => {
	const [leftSideWidth] = useResize({ direction: "horizontal", initial: 50, max: 90, min: 10 });
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

	const frameClass = useMemo(
		() =>
			cn("size-full bg-gray-1100 pb-3 pl-7 transition-all", {
				"rounded-r-none": !sessionId,
			}),
		[sessionId]
	);

	const fetchSessions = useCallback(
		async (nextPageToken?: string) => {
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
				if (!nextPageToken) {
					return data.sessions;
				}

				return [...prevSessions, ...data.sessions];
			});
			setSessionsNextPageToken(data.nextPageToken);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[sessionStateType]
	);

	const debouncedFetchSessions = debounce(fetchSessions, 100);

	const fetchDeployments = useCallback(async () => {
		if (!projectId) {
			return;
		}

		const deployments = await reloadDeploymentsCache(projectId, true);

		const deployment = deployments?.find((deployment) => deployment.deploymentId === deploymentId);

		if (isEqual(deployment?.sessionStats, sessionStats) || !deployment?.sessionStats) {
			return;
		}

		setSessionStats(deployment?.sessionStats);
		await debouncedFetchSessions();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionStats]);

	const debouncedFetchDeployments = debounce(fetchDeployments, 200);

	useEffect(() => {
		debouncedFetchDeployments();
		debouncedFetchSessions();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionStateType]);

	const closeSessionLog = useCallback(() => {
		navigate(`/projects/${projectId}/deployments/${deploymentId}/sessions`);
	}, [navigate, projectId, deploymentId]);

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
			LoggerService.error(
				namespaces.sessionsService,
				tErrors("failedRemoveSessionExtended", { sessionId: selectedSessionId })
			);

			return;
		}

		closeModal(ModalName.deleteDeploymentSession);
		closeSessionLog();
		debouncedFetchDeployments();
	};

	const handleFilterSessions = (stateType?: SessionStateKeyType) => {
		const selectedSessionStateFilter = reverseSessionStateConverter(stateType);
		setSessionStateType(selectedSessionStateFilter);
		closeSessionLog();
	};

	const handleItemsRendered = ({ visibleStopIndex }: ListOnItemsRenderedProps) => {
		if (visibleStopIndex >= sessions.length - 1 && sessionsNextPageToken) {
			debouncedFetchSessions(sessionsNextPageToken);
		}
	};

	const resizeClass = useMemo(
		() =>
			cn(
				"resize-handle-horizontal bg-gray-white z-0 h-[97%] cursor-ew-resize self-center rounded-none p-1.5 transition hover:bg-gray-750",
				{
					"h-full bg-gray-1100 p-1": !sessionId,
				}
			),
		[sessionId]
	);

	return (
		<div className="my-2 flex w-full">
			<div style={{ width: `${leftSideWidth}%` }}>
				<Frame className={frameClass}>
					<div className="flex items-center justify-between gap-2.5">
						<div className="flex flex-wrap items-center gap-2.5">
							<RefreshButton isLoading={isLoading} onRefresh={fetchDeployments} />
						</div>

						<SessionsTableFilter onChange={handleFilterSessions} sessionStats={sessionStats} />
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
									onSessionRemoved={debouncedFetchDeployments}
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

			<div className="flex" style={{ width: `${100 - (leftSideWidth as number)}%` }}>
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
