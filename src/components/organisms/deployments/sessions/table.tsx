import React, { useCallback, useEffect, useMemo, useState } from "react";

import { debounce, isEqual } from "lodash";
import { useTranslation } from "react-i18next";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { ListOnItemsRenderedProps } from "react-window";

import { namespaces } from "@constants";
import { ModalName } from "@enums/components";
import { reverseSessionStateConverter } from "@models/utils";
import { DeploymentsService, LoggerService, SessionsService } from "@services";
import { useResize } from "@src/hooks";
import { DeploymentSession, Session, SessionStateKeyType } from "@type/models";
import { cn } from "@utilities";

import { useModalStore, useToastStore } from "@store";

import { Button, Frame, IconButton, IconSvg, Loader, TBody, THead, Table, Th, Tr } from "@components/atoms";
import { SessionsTableFilter } from "@components/organisms/deployments";
import { DeleteSessionModal, SessionsTableList } from "@components/organisms/deployments/sessions";

import { CatImage } from "@assets/image";
import { ArrowLeft, RotateIcon } from "@assets/image/icons";

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
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const frameClass = useMemo(
		() => cn("h-full w-full bg-gray-1100 pl-7 transition-all", { "rounded-r-none": !sessionId }),
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
					id: Date.now().toString(),
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

		const { data, error } = await DeploymentsService.listByProjectId(projectId!);
		if (error) {
			addToast({
				id: Date.now().toString(),
				message: tErrors("deploymentFetchError", { ns: "services" }),
				type: "error",
			});

			return;
		}
		if (!data?.length) {
			return;
		}

		const deployment = data.find((deployment) => deployment.deploymentId === deploymentId);

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
				id: Date.now().toString(),
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

	const handleRefreshClick = async () => {
		setIsRefreshing(true);
		try {
			await fetchDeployments();
		} finally {
			setTimeout(() => {
				setIsRefreshing(false);
			}, 600);
		}
	};

	const rotateIconClass = useMemo(
		() =>
			cn("animate-spin fill-white transition group-hover:fill-green-800", {
				"animation-running": isRefreshing,
				"animation-paused": !isRefreshing,
			}),
		[isRefreshing]
	);

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
		<div className="flex h-full w-full py-2.5">
			<div style={{ width: `${leftSideWidth}%` }}>
				<Frame className={frameClass}>
					<div className="flex items-center justify-between gap-2.5">
						<div className="flex flex-wrap items-center gap-2.5">
							<IconButton
								ariaLabel={t("ariaLabelReturnBack")}
								className="min-w-20 gap-2 bg-gray-1050 text-sm text-white hover:bg-black"
								onClick={() => navigate(`/projects/${projectId}/deployments`)}
							>
								<ArrowLeft className="h-4" />

								{t("buttons.back")}
							</IconButton>

							<IconButton
								className="group h-[2.125rem] w-[2.125rem] rounded-md bg-gray-1050 hover:bg-gray-1250"
								disabled={isRefreshing}
								onClick={handleRefreshClick}
								title={t("refresh")}
							>
								<IconSvg className={rotateIconClass} size="md" src={RotateIcon} />
							</IconButton>
						</div>

						<SessionsTableFilter onChange={handleFilterSessions} sessionStats={sessionStats} />
					</div>

					{sessions.length ? (
						<div className="relative flex h-full flex-col">
							<Table className="mt-6 flex-1 overflow-hidden">
								<THead>
									<Tr>
										<Th className="group cursor-pointer font-normal">
											{t("table.columns.activationTime")}
										</Th>

										<Th className="group cursor-pointer font-normal">
											{t("table.columns.status")}
										</Th>

										<Th className="group cursor-pointer border-0 font-normal">
											{t("table.columns.sessionId")}
										</Th>

										<Th className="mr-1.5 max-w-20 border-0 font-normal">
											{t("table.columns.actions")}
										</Th>
									</Tr>
								</THead>

								<TBody>
									<SessionsTableList
										onItemsRendered={handleItemsRendered}
										onSelectedSessionId={setSelectedSessionId}
										onSessionRemoved={debouncedFetchDeployments}
										sessions={sessions}
									/>
								</TBody>
							</Table>

							{isLoading ? (
								<div className="flex h-10 w-full items-center">
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
					<Frame className="flex h-full w-full flex-col items-center rounded-l-none bg-gray-1100 pt-40 transition">
						<p className="mb-8 text-lg font-bold text-gray-750">{t("noSelectedSession")}</p>

						<CatImage className="border-b border-gray-750 fill-gray-750" />
					</Frame>
				)}
			</div>

			<DeleteSessionModal onDelete={handleRemoveSession} />
		</div>
	);
};
