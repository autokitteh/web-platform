import React, { useCallback, useEffect, useMemo, useState } from "react";

import { debounce, isEqual, sumBy } from "lodash";
import { useTranslation } from "react-i18next";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { ListOnItemsRenderedProps, ListOnScrollProps } from "react-window";

import { fetchSessionsInterval, namespaces } from "@constants";
import { DeploymentStateVariant } from "@enums";
import { ModalName } from "@enums/components";
import { useInterval } from "@hooks";
import { reverseSessionStateConverter } from "@models/utils";
import { DeploymentsService, LoggerService, SessionsService } from "@services";
import { useModalStore, useToastStore } from "@store";
import { DeploymentSession, Session, SessionStateKeyType } from "@type/models";
import { cn } from "@utilities";

import { Frame, IconButton, TBody, THead, Table, Th, Tr } from "@components/atoms";
import { SessionsTableFilter } from "@components/organisms/deployments";
import { DeleteSessionModal, SessionsTableList } from "@components/organisms/deployments/sessions";

import { CatImage } from "@assets/image";
import { ArrowLeft, RotateIcon } from "@assets/image/icons";

export const SessionsTable = () => {
	const { t: tErrors } = useTranslation(["errors", "services"]);
	const { t } = useTranslation("deployments", { keyPrefix: "sessions" });
	const { closeModal } = useModalStore();
	const { startInterval, stopInterval } = useInterval();
	const { deploymentId, projectId, sessionId } = useParams();
	const navigate = useNavigate();
	const addToast = useToastStore((state) => state.addToast);

	const [sessions, setSessions] = useState<Session[]>([]);
	const [sessionStateType, setSessionStateType] = useState<number>();
	const [selectedSessionId, setSelectedSessionId] = useState<string>();
	const [sessionsNextPageToken, setSessionsNextPageToken] = useState<string>();
	const [tailState, setTailState] = useState({
		display: false,
		live: false,
	});
	const [sessionStats, setSessionStats] = useState<DeploymentSession[]>([]);

	const frameClass = useMemo(
		() => cn("pl-7 bg-gray-700 transition-all w-1/2", { "w-3/4 rounded-r-none": !sessionId }),
		[sessionId]
	);

	const fetchSessions = useCallback(
		async (nextPageToken?: string) => {
			const { data, error } = await SessionsService.listByDeploymentId(
				deploymentId!,
				{
					stateType: sessionStateType,
				},
				nextPageToken
			);

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

		const deploymentState = deployment?.state === DeploymentStateVariant.active ? true : false;
		setTailState({ display: deploymentState, live: deploymentState });

		setSessionStats(deployment?.sessionStats);
		debouncedFetchSessions();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionStats]);

	const debouncedFetchDeployments = debounce(fetchDeployments, 100);

	useEffect(() => {
		debouncedFetchDeployments();
		debouncedFetchSessions();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionStateType]);

	useEffect(() => {
		if (tailState.live) {
			startInterval("sessionsFetchIntervalId", debouncedFetchDeployments, fetchSessionsInterval);
		}
		if (!tailState.live) {
			stopInterval("sessionsFetchIntervalId");
		}

		return () => {
			stopInterval("sessionsFetchIntervalId");
			debouncedFetchDeployments.cancel();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tailState.live]);

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

	const handleScroll = useCallback(
		({ scrollOffset }: ListOnScrollProps) => {
			if (scrollOffset !== 0 && tailState.live) {
				setTailState((prevState) => ({
					...prevState,
					live: !prevState.live,
				}));
			}
		},
		[tailState.live]
	);

	const totalSessions = useMemo(() => {
		return sumBy(sessionStats, "count");
	}, [sessionStats]);

	return (
		<div className="flex h-full w-full py-2.5">
			<Frame className={frameClass}>
				<div className="flex items-center justify-between gap-2.5">
					<div className="flex flex-wrap items-center gap-2.5">
						<IconButton
							ariaLabel={t("ariaLabelReturnBack")}
							className="min-w-20 gap-2 bg-gray-600 text-sm text-white hover:bg-black"
							onClick={() => navigate(`/projects/${projectId}/deployments`)}
						>
							<ArrowLeft className="h-4" />

							{t("buttons.back")}
						</IconButton>

						<div className="font-mediumy text-base text-gray-300">
							{t("totalSessions", { total: totalSessions })}
						</div>

						{tailState.display ? (
							<IconButton
								className="ml-3 h-5 w-5 cursor-pointer p-0"
								onClick={() => setTailState((prevState) => ({ ...prevState, live: !prevState.live }))}
								title={tailState.live ? t("pauseLiveTail") : t("resumeLiveTail")}
							>
								<RotateIcon fill={tailState.live ? "green" : "gray"} />
							</IconButton>
						) : null}
					</div>

					<SessionsTableFilter onChange={handleFilterSessions} sessionStats={sessionStats} />
				</div>

				{sessions.length ? (
					<Table className="mt-4 flex-1 overflow-hidden">
						<THead>
							<Tr>
								<Th className="group cursor-pointer font-normal">
									{t("table.columns.activationTime")}
								</Th>

								<Th className="group cursor-pointer font-normal">{t("table.columns.status")}</Th>

								<Th className="group cursor-pointer border-0 font-normal">
									{t("table.columns.sessionId")}
								</Th>

								<Th className="mr-1.5 max-w-20 border-0 font-normal">{t("table.columns.actions")}</Th>
							</Tr>
						</THead>

						<TBody>
							<SessionsTableList
								onItemsRendered={handleItemsRendered}
								onScroll={handleScroll}
								onSelectedSessionId={setSelectedSessionId}
								sessions={sessions}
							/>
						</TBody>
					</Table>
				) : (
					<div className="mt-10 text-center text-xl font-semibold">{t("noSessions")}</div>
				)}
			</Frame>

			{sessionId ? (
				<Outlet />
			) : (
				<Frame className="w-3/5 rounded-l-none bg-gray-700 pt-20 transition">
					<div className="mt-20 flex flex-col items-center">
						<p className="mb-8 text-lg font-bold text-gray-400">{t("noSelectedSession")}</p>

						<CatImage className="border-b border-gray-400 fill-gray-400" />
					</div>
				</Frame>
			)}

			<DeleteSessionModal onDelete={handleRemoveSession} />
		</div>
	);
};
