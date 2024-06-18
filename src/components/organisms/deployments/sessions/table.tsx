import React, { useState, useEffect, useCallback } from "react";
import { CatImage } from "@assets/image";
import { ArrowLeft } from "@assets/image/icons";
import { IconButton, Frame, TBody, THead, Table, Th, Tr } from "@components/atoms";
import { SessionsTableFilter } from "@components/organisms/deployments";
import { DeleteSessionModal } from "@components/organisms/deployments/sessions";
import { SessionsTableList } from "@components/organisms/deployments/sessions";
import { fetchSessionsInterval } from "@constants";
import { ModalName } from "@enums/components";
import { useInterval } from "@hooks";
import { reverseSessionStateConverter } from "@models/utils";
import { SessionsService } from "@services";
import { useModalStore, useToastStore } from "@store";
import { Session, SessionStateKeyType } from "@type/models";
import { cn } from "@utilities";
import { useTranslation } from "react-i18next";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { ListOnItemsRenderedProps, ListOnScrollProps } from "react-window";

export const SessionsTable = () => {
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("deployments", { keyPrefix: "sessions" });
	const { closeModal } = useModalStore();
	const { startInterval, stopInterval } = useInterval();
	const { projectId, deploymentId, sessionId } = useParams();
	const navigate = useNavigate();
	const addToast = useToastStore((state) => state.addToast);

	const [sessions, setSessions] = useState<Session[]>([]);
	const [sessionStateType, setSessionStateType] = useState<number>();
	const [sessionNextPageToken, setSessionNextPageToken] = useState<string>();
	const [liveTailState, setLiveTailState] = useState(true);

	const frameClass = cn("pl-7 bg-gray-700 transition-all", {
		"w-3/4 rounded-r-none": !sessionId,
		"w-1/2": sessionId,
	});

	const fetchSessions = async () => {
		if (!deploymentId) return;

		const { data, error } = await SessionsService.listByDeploymentId(deploymentId, {
			stateType: sessionStateType,
		});

		if (error) {
			addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
				title: tErrors("error"),
			});
			return;
		}
		if (!data?.sessions) return;

		setSessions(data.sessions);
		setSessionNextPageToken(data.nextPageToken);
	};

	useEffect(() => {
		fetchSessions();

		startInterval("sessionsFetchIntervalId", fetchSessions, fetchSessionsInterval);
		return () => stopInterval("sessionsFetchIntervalId");
	}, [deploymentId, sessionStateType]);

	const handleRemoveSession = async () => {
		if (!sessionId) return;
		const { error } = await SessionsService.deleteSession(sessionId);
		if (error) {
			addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
				title: tErrors("error"),
			});
			return;
		}

		closeModal(ModalName.deleteDeploymentSession);
		fetchSessions();
	};

	const closeSessionLog = useCallback(() => {
		navigate(`/projects/${projectId}/deployments/${deploymentId}`);
	}, []);

	const handleFilterSessions = (stateType?: SessionStateKeyType) => {
		const selectedSessionStateFilter = reverseSessionStateConverter(stateType);
		setSessionStateType(selectedSessionStateFilter);
		closeSessionLog();
	};

	const loadMoreSessions = useCallback(async () => {
		if (!deploymentId || !sessionNextPageToken) return;
		setLiveTailState((prevState) => {
			if (!prevState) stopInterval("sessionsFetchIntervalId");
			return prevState;
		});

		const { data, error } = await SessionsService.listByDeploymentId(
			deploymentId,
			{
				stateType: sessionStateType,
			},
			sessionNextPageToken
		);

		if (error) {
			addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
				title: tErrors("error"),
			});
			return;
		}
		if (!data?.sessions) return;

		setSessions((prevSessions) => [...prevSessions, ...data.sessions]);
		setSessionNextPageToken(data.nextPageToken);
	}, [sessionNextPageToken, liveTailState]);

	const handleItemsRendered = ({ visibleStopIndex }: ListOnItemsRenderedProps) => {
		if (visibleStopIndex >= sessions?.length - 1) {
			loadMoreSessions();
			return;
		}
	};

	const handleScroll = useCallback(({ scrollOffset }: ListOnScrollProps) => {
		if (scrollOffset !== 0) setLiveTailState(false);
	}, []);

	const sessionLogsEditorClass = cn("w-3/5 transition pt-20 bg-gray-700 rounded-l-none");

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
						<div className="text-base text-gray-300">
							{sessions.length} {t("sessionsName")}
						</div>
					</div>
					<SessionsTableFilter onChange={handleFilterSessions} />
				</div>
				{sessions.length ? (
					<Table className="flex-1 mt-4 overflow-hidden border-transparent">
						<THead className="border border-gray-600">
							<Tr>
								<Th className="font-normal cursor-pointer group">{t("table.columns.activationTime")}</Th>
								<Th className="font-normal cursor-pointer group">{t("table.columns.status")}</Th>
								<Th className="font-normal border-0 cursor-pointer group">{t("table.columns.sessionId")}</Th>

								<Th className="font-normal border-0 max-w-20 mr-1.5">Actions</Th>
							</Tr>
						</THead>
						<TBody className="border border-gray-600">
							<SessionsTableList onItemsRendered={handleItemsRendered} onScroll={handleScroll} sessions={sessions} />
						</TBody>
					</Table>
				) : (
					<div className="mt-10 text-xl font-semibold text-center">{t("noSessions")}</div>
				)}
			</Frame>
			{sessionId ? (
				<Outlet />
			) : (
				<Frame className={sessionLogsEditorClass}>
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
