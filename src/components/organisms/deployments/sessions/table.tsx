import React, { useState, useEffect, useCallback, useMemo } from "react";
import { CatImage } from "@assets/image";
import { ArrowLeft, RotateIcon } from "@assets/image/icons";
import { IconButton, Frame, TBody, THead, Table, Th, Tr } from "@components/atoms";
import { SessionsTableFilter } from "@components/organisms/deployments";
import { DeleteSessionModal } from "@components/organisms/deployments/sessions";
import { SessionsTableList } from "@components/organisms/deployments/sessions";
import { fetchSessionsInterval, namespaces } from "@constants";
import { DeploymentStateVariant } from "@enums";
import { ModalName } from "@enums/components";
import { useInterval } from "@hooks";
import { reverseSessionStateConverter } from "@models/utils";
import { LoggerService, SessionsService, DeploymentsService } from "@services";
import { useModalStore, useToastStore } from "@store";
import { Session, SessionStateKeyType, DeploymentSession } from "@type/models";
import { cn } from "@utilities";
import { debounce, isEqual, sumBy } from "lodash";
import { useTranslation } from "react-i18next";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { ListOnItemsRenderedProps, ListOnScrollProps } from "react-window";

export const SessionsTable = () => {
	const { t: tErrors } = useTranslation(["errors", "services"]);
	const { t } = useTranslation("deployments", { keyPrefix: "sessions" });
	const { closeModal } = useModalStore();
	const { startInterval, stopInterval } = useInterval();
	const { projectId, deploymentId, sessionId } = useParams();
	const navigate = useNavigate();
	const addToast = useToastStore((state) => state.addToast);

	const [sessions, setSessions] = useState<Session[]>([]);
	const [sessionStateType, setSessionStateType] = useState<number>();
	const [selectedSessionId, setSelectedSessionId] = useState<string>();
	const [sessionsNextPageToken, setSessionsNextPageToken] = useState<string>();
	const [tailState, seTailState] = useState({
		live: false,
		display: false,
	});
	const [sessionStats, setSessionStats] = useState<DeploymentSession[]>([]);

	const frameClass = useMemo(
		() => cn("pl-7 bg-gray-700 transition-all w-1/2", { "w-3/4 rounded-r-none": !sessionId }),
		[sessionId]
	);

	const fetchDeployments = useCallback(async () => {
		if (!projectId) return;
		const { data, error } = await DeploymentsService.listByProjectId(projectId!);
		if (error) {
			addToast({
				id: Date.now().toString(),
				message: tErrors("deploymentFetchError", { ns: "services" }),
				type: "error",
				title: tErrors("error"),
			});
			return;
		}
		if (!data?.length) return;

		const deployment = data.find((deployment) => deployment.deploymentId === deploymentId);

		if (isEqual(deployment?.sessionStats, sessionStats) || !deployment?.sessionStats) return;

		const deploymentState = deployment?.state === DeploymentStateVariant.active ? true : false;
		seTailState({ live: deploymentState, display: deploymentState });

		setSessionStats(deployment?.sessionStats);
		debouncedFetchSessions();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionStats]);

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
					title: tErrors("error"),
				});
				LoggerService.error(
					namespaces.sessionsService,
					tErrors("sessionsFetchErrorExtended", { error: (error as Error).message })
				);
				return;
			}

			if (!data?.sessions) return;

			setSessions((prevSessions) => {
				if (!nextPageToken) return data.sessions;
				return [...prevSessions, ...data.sessions];
			});
			setSessionsNextPageToken(data.nextPageToken);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[sessionStateType]
	);

	const debouncedFetchSessions = debounce(fetchSessions, 100);
	const debouncedFetchDeployments = debounce(fetchDeployments, 100);

	useEffect(() => {
		debouncedFetchDeployments();
		debouncedFetchSessions();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionStateType]);

	useEffect(() => {
		if (tailState.live) startInterval("sessionsFetchIntervalId", debouncedFetchDeployments, fetchSessionsInterval);
		if (!tailState.live) stopInterval("sessionsFetchIntervalId");
		return () => {
			stopInterval("sessionsFetchIntervalId");
			debouncedFetchDeployments.cancel();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tailState.live]);

	const handleRemoveSession = async () => {
		if (!selectedSessionId) return;
		const { error } = await SessionsService.deleteSession(selectedSessionId);
		if (error) {
			addToast({
				id: Date.now().toString(),
				message: tErrors("failedRemoveSession"),
				type: "error",
				title: tErrors("error"),
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

	const closeSessionLog = useCallback(() => {
		navigate(`/projects/${projectId}/deployments/${deploymentId}/sessions`);
	}, [navigate, projectId, deploymentId]);

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
			if (scrollOffset !== 0 && tailState.live)
				seTailState((prevState) => ({
					...prevState,
					live: !prevState.live,
				}));
		},
		[tailState.live]
	);

	const totalSessions = useMemo(() => {
		return sumBy(sessionStats, "count");
	}, [sessionStats]);

	return (
		<div className="flex w-full h-full">
			<Frame className={frameClass}>
				<div className="flex items-center justify-between gap-2.5">
					<div className="flex items-center flex-wrap gap-2.5">
						<IconButton
							ariaLabel={t("ariaLabelReturnBack")}
							className="gap-2 text-sm text-white bg-gray-600 hover:bg-black min-w-20"
							onClick={() => navigate(`/projects/${projectId}/deployments`)}
						>
							<ArrowLeft className="h-4" />
							{t("buttons.back")}
						</IconButton>
						<div className="text-base text-gray-300 font-mediumy">{t("totalSessions", { total: totalSessions })}</div>
						{tailState.display ? (
							<IconButton
								className="w-5 h-5 p-0 ml-3 cursor-pointer"
								onClick={() => seTailState((prevState) => ({ ...prevState, live: !prevState.live }))}
								title={tailState.live ? t("pauseLiveTail") : t("resumeLiveTail")}
							>
								<RotateIcon fill={tailState.live ? "green" : "gray"} />
							</IconButton>
						) : null}
					</div>
					<SessionsTableFilter onChange={handleFilterSessions} sessionStats={sessionStats} />
				</div>
				{sessions.length ? (
					<Table className="flex-1 mt-4 overflow-hidden border-transparent border-none">
						<THead>
							<Tr className="rounded-3xl">
								<Th className="font-normal cursor-pointer group">{t("table.columns.activationTime")}</Th>
								<Th className="font-normal cursor-pointer group">{t("table.columns.status")}</Th>
								<Th className="font-normal border-0 cursor-pointer group">{t("table.columns.sessionId")}</Th>
								<Th className="font-normal border-0 max-w-20 mr-1.5">{t("table.columns.actions")}</Th>
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
					<div className="mt-10 text-xl font-semibold text-center">{t("noSessions")}</div>
				)}
			</Frame>
			{sessionId ? (
				<Outlet />
			) : (
				<Frame className="w-3/5 pt-20 transition bg-gray-700 rounded-l-none">
					<div className="flex flex-col items-center mt-20">
						<p className="mb-8 text-lg font-bold text-gray-400">{t("noSelectedSession")}</p>
						<CatImage className="border-b border-gray-400 fill-gray-400" />
					</div>
				</Frame>
			)}
			<DeleteSessionModal onDelete={handleRemoveSession} />
		</div>
	);
};
