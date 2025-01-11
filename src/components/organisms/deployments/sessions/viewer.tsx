import React, { useCallback, useEffect, useMemo, useState } from "react";

import JsonView from "@uiw/react-json-view";
import { githubDarkTheme } from "@uiw/react-json-view/githubDark";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import ReactTimeAgo from "react-time-ago";

import {
	dateTimeFormat,
	defaultSessionTab,
	namespaces,
	sessionLogRowHeight,
	sessionTabs,
	timeFormat,
} from "@constants";
import { LoggerService } from "@services/index";
import { SessionsService } from "@services/sessions.service";
import { SessionState } from "@src/enums";
import { ViewerSession } from "@src/interfaces/models/session.interface";
import { useActivitiesCacheStore, useOutputsCacheStore, useToastStore } from "@src/store";

import { Frame, IconSvg, Loader, LogoCatLarge, Tab } from "@components/atoms";
import { Accordion, CopyButton, RefreshButton } from "@components/molecules";
import { SessionsTableState } from "@components/organisms/deployments";

import { ArrowRightIcon, CircleMinusIcon, CirclePlusIcon } from "@assets/image/icons";

export const SessionViewer = () => {
	const { sessionId } = useParams<{
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

	const { loading: loadingOutputs, reload: reloadOutputs } = useOutputsCacheStore();
	const { loading: loadingActivities, reload: reloadActivities } = useActivitiesCacheStore();

	const fetchSessionInfo = useCallback(async () => {
		if (!sessionId) return;
		const { data: sessionInfoResponse, error } = await SessionsService.getSessionInfo(sessionId);

		if (error) {
			addToast({ message: tErrors("fetchSessionFailed"), type: "error" });

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
		await reloadOutputs(sessionInfo.sessionId, sessionLogRowHeight);
		await reloadActivities(sessionInfo.sessionId, sessionLogRowHeight);
		setIsLoading(false);
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

		return `${hours ? `${String(hours).padStart(2, "0")}:` : ""}${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
	}, []);

	const isRefreshButtonDisabled = useMemo(
		() =>
			sessionInfo?.state !== SessionState.completed &&
			sessionInfo?.state !== SessionState.error &&
			sessionInfo?.state !== SessionState.stopped,
		[sessionInfo?.state]
	);

	if (!sessionInfo) return null;

	return isLoading && isInitialLoad ? (
		<Loader size="xl" />
	) : (
		<Frame className="overflow-y-auto overflow-x-hidden rounded-l-none pb-3 font-fira-code">
			<div className="flex items-center justify-end border-b border-gray-950 pb-3.5">
				<RefreshButton disabled={!isRefreshButtonDisabled} isLoading={isLoading} onRefresh={fetchSessions} />
			</div>

			<div className="mt-2.5 flex justify-between">
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
							<IconSvg className="mx-2 inline fill-white" size="sm" src={ArrowRightIcon} />
							<div className="inline">{sessionInfo.entrypoint.name}</div>
						</div>
					</div>
					<div className="flex items-center gap-4">
						<div className="w-32 text-gray-1550" title="Start Time">
							Time:
						</div>
						<div className="flex flex-row items-center">
							{moment(sessionInfo.createdAt).local().format(dateTimeFormat)}
							<IconSvg className="mx-2 fill-white" size="sm" src={ArrowRightIcon} />
							{sessionInfo.state === SessionState.completed ||
							sessionInfo.state === SessionState.error ? (
								<div title="End Time">{moment(sessionInfo.updatedAt).local().format(timeFormat)}</div>
							) : (
								<SessionsTableState sessionState={sessionInfo.state} />
							)}
							<div className="ml-2">
								(
								{sessionInfo.state === SessionState.completed ||
								sessionInfo.state === SessionState.error ? (
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
						<CopyButton className="p-0" size="xs" text={sessionInfo.sessionId} />
					</div>
					{sessionInfo.eventId ? (
						<div className="flex items-center justify-end gap-4">
							<div className="leading-6">{t("eventId")}</div>
							<CopyButton className="p-0" size="xs" text={sessionInfo.eventId} />
						</div>
					) : null}
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
				<div className="scrollbar my-5 flex items-center gap-2 overflow-x-auto overflow-y-hidden whitespace-nowrap uppercase xl:gap-4 2xl:gap-6">
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
					<div>
						<Loader size="sm" />
					</div>
				) : null}
			</div>

			<Outlet />
			<LogoCatLarge />
		</Frame>
	);
};
