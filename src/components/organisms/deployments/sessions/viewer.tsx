import React, { useCallback, useEffect, useState, useMemo } from "react";

import JsonView from "@uiw/react-json-view";
import { githubDarkTheme } from "@uiw/react-json-view/githubDark";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import ReactTimeAgo from "react-time-ago";

import { ExecutionFlowChart } from "./activities-chart/executionFlowChart";
import {
	dateTimeFormat,
	defaultSessionsPageSize,
	defaultSessionTab,
	namespaces,
	sessionLogRowHeight,
	sessionTabs,
	timeFormat,
} from "@constants";
import { LoggerService } from "@services/index";
import { SessionsService } from "@services/sessions.service";
import { EventListenerName, SessionState } from "@src/enums";
import { triggerEvent, useEventListener } from "@src/hooks";
import { ViewerSession } from "@src/interfaces/models/session.interface";
import { useActivitiesCacheStore, useOutputsCacheStore, useToastStore } from "@src/store";
import { copyToClipboard } from "@src/utilities";

import { Button, Frame, IconSvg, Loader, LogoCatLarge, Tab, Tooltip } from "@components/atoms";
import { Accordion, IdCopyButton } from "@components/molecules";
import { SessionsTableState } from "@components/organisms/deployments";

import { DownloadIcon, ArrowRightIcon, CircleMinusIcon, CirclePlusIcon, CopyIcon } from "@assets/image/icons";

dayjs.extend(duration);

export const SessionViewer = () => {
	const { deploymentId, projectId, sessionId } = useParams<{
		deploymentId: string;
		projectId: string;
		sessionId: string;
	}>();
	const { t } = useTranslation("deployments", { keyPrefix: "sessions.viewer" });
	const { t: tErrors } = useTranslation("errors");

	const navigate = useNavigate();
	const location = useLocation();
	const [activeTab, setActiveTab] = useState(defaultSessionTab);
	const [sessionInfo, setSessionInfo] = useState<ViewerSession | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isInitialLoad, setIsInitialLoad] = useState(true);
	const addToast = useToastStore((state) => state.addToast);
	const [isCopyingLogs, setIsCopyingLogs] = useState(false);
	const [isDownloadingLogs, setIsDownloadingLogs] = useState(false);

	const { loading: loadingOutputs, loadLogs: loadOutputs, sessions: outputsSessions } = useOutputsCacheStore();
	const { loading: loadingActivities, loadLogs: loadActivities, sessions } = useActivitiesCacheStore();

	const copySessionLogs = async () => {
		if (!sessionId) return;
		setIsCopyingLogs(true);
		const { isError, message } = await copyToClipboard(
			outputsSessions[sessionId].outputs.map((log) => `[${log.time}]: ${log.print}`).join("\n")
		);
		addToast({
			message: message,
			type: isError ? "error" : "success",
		});
		setIsCopyingLogs(false);
	};

	const downloadSessionLogs = async () => {
		if (!sessionId) return;
		setIsDownloadingLogs(true);
		const { data: logContent } = await SessionsService.downloadLogs(sessionId);
		if (!logContent) {
			addToast({ message: t("noLogsFound"), type: "error" });
			return;
		}
		const blob = new Blob([logContent], { type: "text/plain;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		if (!sessionInfo) return;
		const timestamp = moment(sessionInfo.createdAt).format("YY-MM-DD_HH-mm");
		link.download = `${timestamp}_${sessionId}.log`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
		setIsDownloadingLogs(false);
	};

	const closeEditor = useCallback(() => {
		if (deploymentId) {
			navigate(`/projects/${projectId}/deployments/${deploymentId}/sessions`);

			return;
		}
		navigate(`/projects/${projectId}/sessions`);
	}, [navigate, projectId, deploymentId]);

	const fetchSessionInfo = useCallback(async () => {
		if (!sessionId) return;
		const { data: sessionInfoResponse, error } = await SessionsService.getSessionInfo(sessionId);

		if (error) {
			addToast({ message: tErrors("fetchSessionFailed"), type: "error" });
			closeEditor();

			return;
		}
		if (!sessionInfoResponse) {
			addToast({ message: t("sessionNotFound"), type: "error" });
			LoggerService.error(namespaces.ui.sessionsViewer, t("sessionNotFound", { sessionId }));

			return;
		}
		setSessionInfo(sessionInfoResponse);

		if (isInitialLoad) {
			setIsInitialLoad(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionId]);

	useEffect(() => {
		fetchSessionInfo();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionId]);

	const fetchSessions = useCallback(async () => {
		if (!sessionInfo) return;
		setIsLoading(true);
		await fetchSessionInfo();
		const { error: outputsError } = await loadOutputs(sessionInfo.sessionId, sessionLogRowHeight, true);
		if (outputsError) {
			addToast({ message: t("outputLogsFetchError"), type: "error" });
		}
		const { error: activitiesError } = await loadActivities(sessionInfo.sessionId, sessionLogRowHeight, true);
		if (activitiesError) {
			addToast({ message: t("activityLogsFetchError"), type: "error" });
		}
		setIsLoading(false);
		triggerEvent(EventListenerName.sessionLogViewerScrollToTop);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionInfo, fetchSessionInfo, loadOutputs, loadActivities]);

	useEventListener(EventListenerName.sessionReload, () => {
		if (
			sessionInfo?.state &&
			[SessionState.running, SessionState.created, SessionState.unspecified].includes(sessionInfo.state)
		) {
			fetchSessions();
		}
	});

	useEffect(() => {
		if (sessionInfo && sessionId) {
			loadActivities(sessionId, defaultSessionsPageSize, true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionId, sessionInfo]);

	useEffect(() => {
		const pathSegments = location.pathname.split("/");
		const lastSegment = pathSegments[pathSegments.length - 1];

		const activeTabValue = sessionTabs.some((tab) => tab.value.toLowerCase() === lastSegment)
			? lastSegment
			: defaultSessionTab;

		setActiveTab(activeTabValue);
	}, [location.pathname]);

	const goTo = useCallback(
		(path: string) => {
			if (path === defaultSessionTab) {
				navigate(".");
				return;
			}

			navigate(path.toLowerCase());
		},
		[navigate]
	);

	const formatTimeDifference = useCallback((endDate: Date, startDate: Date) => {
		const duration = dayjs.duration(dayjs(endDate).diff(dayjs(startDate)));
		const months = Math.floor(duration.asMonths());
		const weeks = Math.floor(duration.asWeeks());
		const days = Math.floor(duration.asDays());
		const hours = duration.hours();
		const minutes = duration.minutes();
		const seconds = duration.seconds();

		if (months >= 1) return `${months}m`;
		if (weeks >= 1) return `${weeks}w`;
		if (days >= 1) return `${days}d`;

		return `${hours ? `${String(hours).padStart(2, "0")}:` : ""}${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
	}, []);

	const currentSessionActivities = useMemo(() => {
		if (!sessionId || !sessions[sessionId]) return [];
		return sessions[sessionId].activities;
	}, [sessionId, sessions]);

	if (!sessionInfo) return null;

	const isSessionCompleted = [SessionState.completed, SessionState.error].includes(sessionInfo.state);

	return isLoading && isInitialLoad ? (
		<Loader size="xl" />
	) : (
		<Frame className="pb-3 overflow-x-hidden overflow-y-auto rounded-l-none font-fira-code">
			<div className="flex justify-between">
				<div className="flex flex-col gap-0.5 leading-6">
					<div className="flex items-center gap-4">
						<div className="w-32 text-gray-1550">{t("status")}</div>
						<SessionsTableState sessionState={sessionInfo.state} />
					</div>
					<div className="flex items-center gap-4">
						<div className="w-32 text-gray-1550">{t("source")}</div>
						<span className="capitalize">{sessionInfo.sourceType?.toLowerCase()}</span>
						<span> - {sessionInfo.triggerName}</span>
					</div>
					<div className="flex items-center gap-4">
						<div className="w-32 text-gray-1550">{t("entrypoint")}</div>
						<div className="inline">
							<div className="inline">{sessionInfo.entrypoint.path}</div>
							<IconSvg className="inline mx-2 fill-white" size="sm" src={ArrowRightIcon} />
							<div className="inline">{sessionInfo.entrypoint.name}</div>
						</div>
					</div>
					<div className="flex items-center gap-4">
						<div className="w-32 text-gray-1550" title="Start Time">
							Time:
						</div>
						<div className="flex flex-row items-center">
							{dayjs(sessionInfo.createdAt).format(dateTimeFormat)}
							<IconSvg className="mx-2 fill-white" size="sm" src={ArrowRightIcon} />
							{isSessionCompleted ? (
								<div title="End Time">{dayjs(sessionInfo.updatedAt).format(timeFormat)}</div>
							) : (
								<SessionsTableState sessionState={sessionInfo.state} />
							)}
							<div className="ml-2">
								(
								{isSessionCompleted ? (
									formatTimeDifference(sessionInfo.updatedAt, sessionInfo.createdAt)
								) : (
									<ReactTimeAgo date={sessionInfo.createdAt} locale="en-US" timeStyle="mini" />
								)}
								)
							</div>
						</div>
					</div>
				</div>

				<div className="flex flex-col gap-0.5">
					<div className="flex items-center justify-end gap-4">
						<div className="leading-6">{t("sessionId")}</div>
						<IdCopyButton hideId id={sessionInfo.sessionId} />
					</div>
					{sessionInfo.eventId ? (
						<div className="flex items-center justify-end gap-4">
							<div className="leading-6">{t("eventId")}</div>
							<IdCopyButton hideId id={sessionInfo.eventId} />
						</div>
					) : null}
					<div className="flex items-center justify-end gap-4">
						<div className="leading-6">{t("buildId")}</div>
						<IdCopyButton hideId id={sessionInfo.buildId} />
					</div>
				</div>
			</div>

			<div className="flex items-start justify-between flex-1">
				<div className="flex-1">
					{sessionInfo.inputs ? (
						<div className="mt-3 max-w-[80%] pb-3.5">
							<Accordion
								classChildren="border-none pt-3 pb-0"
								classIcon="fill-none group-hover:fill-none group-hover:stroke-green-800 stroke-white size-5 mb-0.5"
								closeIcon={CircleMinusIcon}
								openIcon={CirclePlusIcon}
								title={t("inputs")}
							>
								<JsonView
									className="scrollbar max-h-72 overflow-auto rounded-md border border-gray-1000 !bg-transparent p-2"
									style={githubDarkTheme}
									value={sessionInfo.inputs}
								/>
							</Accordion>
						</div>
					) : null}
				</div>

				<div className="flex mt-3">
					<Tooltip content={t("copy")} position="bottom">
						<Button
							className="py-2 pl-2 text-white group disabled:cursor-not-allowed disabled:opacity-50"
							disabled={isCopyingLogs}
							onClick={copySessionLogs}
						>
							{isCopyingLogs ? (
								<div className="flex items-center size-4">
									<Loader size="sm" />
								</div>
							) : (
								<IconSvg className="fill-white group-hover:fill-green-800" size="md" src={CopyIcon} />
							)}
						</Button>
					</Tooltip>
					<Tooltip content={t("download")} position="bottom">
						<Button
							className="py-2 pl-2 text-white group disabled:cursor-not-allowed disabled:opacity-50"
							disabled={isDownloadingLogs}
							onClick={downloadSessionLogs}
						>
							{isDownloadingLogs ? (
								<div className="flex items-center size-4">
									<Loader size="sm" />
								</div>
							) : (
								<IconSvg
									className="fill-white group-hover:fill-green-800"
									size="md"
									src={DownloadIcon}
								/>
							)}
						</Button>
					</Tooltip>
				</div>
			</div>

			{sessionInfo.memo && Object.keys(sessionInfo.memo).length ? (
				<div className="mt-3 pb-3.5">
					<Accordion
						classChildren="border-none pt-3 pb-0"
						classIcon="fill-none group-hover:fill-none group-hover:stroke-green-800 stroke-white size-5 mb-0.5"
						className="max-w-[80%]"
						closeIcon={CircleMinusIcon}
						openIcon={CirclePlusIcon}
						title={t("memo")}
					>
						<JsonView
							className="scrollbar max-h-72 overflow-auto rounded-md border border-gray-1000 !bg-transparent p-2"
							style={githubDarkTheme}
							value={sessionInfo.memo}
						/>
					</Accordion>
				</div>
			) : null}

			{currentSessionActivities.length ? (
				<Accordion
					classChildren="border-none pt-3 pb-0"
					classIcon="fill-none group-hover:fill-none group-hover:stroke-green-800 stroke-white size-5 mb-0.5"
					closeIcon={CircleMinusIcon}
					openIcon={CirclePlusIcon}
					title={t("executionChart")}
				>
					<ExecutionFlowChart activities={currentSessionActivities} />
				</Accordion>
			) : null}

			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2 my-5 overflow-x-auto overflow-y-hidden uppercase scrollbar whitespace-nowrap xl:gap-4 2xl:gap-6">
					{sessionTabs.map((singleTab) => (
						<Tab
							activeTab={activeTab}
							ariaLabel={singleTab.label}
							className="p-0 font-fira-sans"
							key={singleTab.value}
							onClick={() => goTo(singleTab.value)}
							value={singleTab.value}
						>
							{singleTab.label}
						</Tab>
					))}
				</div>
				{loadingOutputs || loadingActivities ? (
					<div className="flex justify-end">
						<Loader size="sm" />
					</div>
				) : null}
			</div>

			<div className="h-full min-h-64">
				<Outlet />
			</div>
			<LogoCatLarge />
		</Frame>
	);
};
