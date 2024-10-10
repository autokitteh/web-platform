import React, { useCallback, useEffect, useMemo, useState } from "react";

import JsonView from "@uiw/react-json-view";
import { githubDarkTheme } from "@uiw/react-json-view/githubDark";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import ReactTimeAgo from "react-time-ago";

import { defaultSessionTab, sessionTabs } from "@constants";
import { SessionsService } from "@services/sessions.service";
import { SessionState } from "@src/enums";
import { useActivitiesCacheStore, useOutputsCacheStore, useToastStore } from "@src/store";
import { ViewerSession } from "@src/types/models/session.type";

import { Frame, IconButton, IconSvg, LogoCatLarge, Tab } from "@components/atoms";
import { Accordion, CopyButton, RefreshButton } from "@components/molecules";
import { SessionsTableState } from "@components/organisms/deployments";

import { ArrowRightIcon, CircleMinusIcon, CirclePlusIcon, Close } from "@assets/image/icons";

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
	const addToast = useToastStore((state) => state.addToast);

	const { reload: reloadOutputs } = useOutputsCacheStore();
	const { reload: reloadActivities } = useActivitiesCacheStore();

	const closeEditor = useCallback(
		() => navigate(`/projects/${projectId}/deployments/${deploymentId}/sessions`),
		[navigate, projectId, deploymentId]
	);

	const fetchSessionInfo = useCallback(async () => {
		if (!sessionId) return;
		setIsLoading(true);
		try {
			const { data: sessionInfoResponse, error } = await SessionsService.getSessionInfo(sessionId);
			if (error) {
				addToast({ message: tErrors("fetchSessionFailed"), type: "error" });

				return;
			}
			setSessionInfo(sessionInfoResponse!);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			addToast({ message: tErrors("fetchSessionFailed"), type: "error" });
		} finally {
			setIsLoading(false);
		}
	}, [sessionId, addToast, tErrors]);

	useEffect(() => {
		fetchSessionInfo();
	}, [fetchSessionInfo]);

	const fetchSessions = useCallback(async () => {
		if (!sessionInfo) return;
		fetchSessionInfo();
		reloadOutputs(sessionInfo.sessionId);
		reloadActivities(sessionInfo.sessionId);
	}, [sessionInfo, fetchSessionInfo, reloadOutputs, reloadActivities]);

	useEffect(() => {
		const activeTabIndex = location.pathname.split("/").filter(Boolean)[6] || defaultSessionTab;
		setActiveTab(activeTabIndex);
	}, [location]);

	const goTo = useCallback(
		(path: string) => {
			navigate(path === defaultSessionTab ? "" : path.toLowerCase());
		},
		[navigate]
	);

	const formatTimeDifference = useCallback((endDate: Date, startDate: Date) => {
		const duration = moment.duration(moment(endDate).diff(moment(startDate)));
		const months = Math.floor(duration.asMonths());
		const weeks = Math.floor(duration.asWeeks());
		const days = Math.floor(duration.asDays());
		const hours = duration.hours();
		const minutes = duration.minutes();
		const seconds = duration.seconds();

		if (months >= 1) return `${months}m`;
		if (weeks >= 1) return `${weeks}w`;
		if (days >= 1) return `${days}d`;

		return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
	}, []);

	const sessionDetails = useMemo(() => {
		if (!sessionInfo) return null;
		const { createdAt, state, updatedAt } = sessionInfo;
		const isCompleted = state === SessionState.completed || state === SessionState.error;

		return {
			createdAt: moment(createdAt).format("MM.DD.YY  HH:mm"),
			startTime: moment(createdAt).format("HH:mm:ss"),
			endTime: isCompleted ? moment(updatedAt).format("HH:mm:ss") : <SessionsTableState sessionState={state} />,
			duration: isCompleted ? (
				formatTimeDifference(updatedAt, createdAt)
			) : (
				<ReactTimeAgo date={createdAt} locale="en-US" timeStyle="mini" />
			),
		};
	}, [sessionInfo, formatTimeDifference]);

	if (!sessionInfo) return null;

	return (
		<Frame className="overflow-hidden rounded-l-none pb-3 font-fira-code">
			<div className="flex items-center justify-between border-b border-gray-950 pb-3.5">
				<div className="flex gap-3 font-fira-sans text-base text-gray-500">
					<span>{sessionDetails?.createdAt}</span>
					{sessionInfo.triggerName}
				</div>
				<div className="flex items-center gap-3">
					<RefreshButton isLoading={isLoading} onRefresh={fetchSessions} />
					<IconButton
						ariaLabel={t("buttons.ariaCloseEditor")}
						className="size-7 bg-gray-1100 p-0.5"
						onClick={closeEditor}
					>
						<Close className="size-3 fill-white" />
					</IconButton>
				</div>
			</div>

			<div className="mt-2.5 flex justify-between gap-6">
				<div className="flex flex-col gap-0.5 leading-6">
					<div className="flex items-center gap-4">
						<div className="w-44 text-gray-1550">{t("status")}</div>
						<SessionsTableState sessionState={sessionInfo.state} />
					</div>
					<div className="flex items-center gap-4">
						<div className="w-44 text-gray-1550">{t("source")}</div>
						{sessionInfo.sourceType}
					</div>
					<div className="flex items-center gap-4">
						<div className="w-44 text-gray-1550">{t("connectionName")}</div>
					</div>
					<div className="flex items-center gap-4">
						<div className="w-44 text-gray-1550">{t("entrypoint")}</div>
						<div className="inline">
							<div className="inline">{sessionInfo.entrypoint.path}</div>
							<IconSvg className="mx-2 inline fill-white" size="sm" src={ArrowRightIcon} />
							<div className="inline">{sessionInfo.entrypoint.name}</div>
						</div>
					</div>
					<div className="flex items-center gap-4">
						<div className="w-44 text-gray-1550" title="Start Time">
							Time:
						</div>
						<div className="flex flex-row items-center">
							{moment(sessionInfo.createdAt).format("HH:mm:ss")}
							<IconSvg className="mx-2 fill-white" size="sm" src={ArrowRightIcon} />
							{sessionInfo.state === SessionState.completed ||
							sessionInfo.state === SessionState.error ? (
								<div title="End Time">{moment(sessionInfo.updatedAt).format("HH:mm:ss")}</div>
							) : (
								<SessionsTableState sessionState={sessionInfo.state} />
							)}
						</div>
					</div>
					<div className="flex items-center gap-4">
						<div className="w-44 text-gray-1550">Duration</div>
						{sessionInfo.state === SessionState.completed || sessionInfo.state === SessionState.error ? (
							formatTimeDifference(sessionInfo.updatedAt, sessionInfo.createdAt)
						) : (
							<ReactTimeAgo date={sessionInfo.createdAt} locale="en-US" timeStyle="mini" />
						)}
					</div>
				</div>

				<div className="flex flex-col gap-0.5">
					<div className="flex items-center justify-end gap-4">
						<div className="leading-6">{t("sessionId")}</div>
						<CopyButton className="p-0" size="xs" text={sessionInfo.sessionId} />
					</div>
					<div className="flex items-center justify-end gap-4">
						<div className="leading-6">{t("eventId")}</div>
						<CopyButton className="p-0" size="xs" text={sessionInfo.eventId} />
					</div>
					<div className="flex items-center justify-end gap-4">
						<div className="leading-6">{t("buildId")}</div>
						<CopyButton className="p-0" size="xs" text={sessionInfo.buildId} />
					</div>
				</div>
			</div>

			{sessionInfo.inputs ? (
				<div className="mt-3 border-b border-gray-950 pb-3.5">
					<Accordion
						classChildren="border-none pt-3 pb-0"
						classIcon="fill-none group-hover:fill-none group-hover:stroke-green-800 stroke-white size-5 mb-0.5"
						closeIcon={CircleMinusIcon}
						openIcon={CirclePlusIcon}
						title="Inputs"
					>
						<JsonView
							className="scrollbar max-h-72 overflow-auto"
							style={githubDarkTheme}
							value={sessionInfo.inputs}
						/>
					</Accordion>
				</div>
			) : null}

			<div className="flex items-center justify-between">
				<div className="scrollbar xl:gap-4 my-5 flex items-center gap-2 overflow-x-auto overflow-y-hidden whitespace-nowrap uppercase 2xl:gap-6">
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
			</div>

			<Outlet />
			<LogoCatLarge />
		</Frame>
	);
};
