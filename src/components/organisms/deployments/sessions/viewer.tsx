/* eslint-disable @liferay/empty-line-between-elements */
import React, { useEffect, useState } from "react";

import JsonView from "@uiw/react-json-view";
import { githubDarkTheme } from "@uiw/react-json-view/githubDark";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import ReactTimeAgo from "react-time-ago";

import { defaultSessionTab, sessionTabs } from "@constants";
import { SessionsService } from "@services/sessions.service";
import { SessionState } from "@src/enums";
import { useToastStore } from "@src/store";
import { useCacheStore } from "@src/store/useCacheStore";
import { ViewerSession } from "@src/types/models/session.type";

import { Frame, IconButton, IconSvg, LogoCatLarge, Tab } from "@components/atoms";
import { Accordion, CopyButton, RefreshButton } from "@components/molecules";
import { SessionsTableState } from "@components/organisms/deployments";

import { ArrowRightIcon, Close } from "@assets/image/icons";

export const SessionViewer = () => {
	const { deploymentId, projectId, sessionId } = useParams();
	const { t } = useTranslation("deployments", { keyPrefix: "sessions.viewer" });
	const { t: tErrors } = useTranslation("errors");

	const navigate = useNavigate();
	const location = useLocation();
	const [activeTab, setActiveTab] = useState(defaultSessionTab);
	const [sessionInfo, setSessionInfo] = useState<ViewerSession>();
	const [isLoading, setIsLoading] = useState(false);
	const addToast = useToastStore((state) => state.addToast);

	const closeEditor = () => navigate(`/projects/${projectId}/deployments/${deploymentId}/sessions`);

	useEffect(() => {
		const pathParts = location.pathname.split("/").filter(Boolean);
		const activeTabIndex = pathParts[6] || defaultSessionTab;
		setActiveTab(activeTabIndex);
	}, [location]);

	const { reload } = useCacheStore();

	const fetchSessions = async () => {
		if (!sessionInfo) return;

		reload(sessionInfo.sessionId);
	};

	const fetchSessionInfo = async () => {
		try {
			setIsLoading(true);
			const { data: sessionInfoResponse, error } = await SessionsService.getSessionInfo(sessionId!);
			setIsLoading(false);

			if (error) {
				addToast({
					message: tErrors("fetchSessionFailed"),
					type: "error",
				});

				return;
			}
			setSessionInfo(sessionInfoResponse);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			addToast({
				message: tErrors("fetchSessionFailed"),
				type: "error",
			});
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchSessionInfo();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionId]);

	const goTo = (path: string) => {
		if (path === defaultSessionTab) {
			navigate("");

			return;
		}
		navigate(path.toLowerCase());
	};

	function formatTimeDifference(endDate: Date, stardDate: Date) {
		const duration = moment.duration(moment(endDate).diff(moment(stardDate)));

		const months = Math.floor(duration.asMonths());
		const weeks = Math.floor(duration.asWeeks());
		const days = Math.floor(duration.asDays());
		const hours = duration.hours();
		const minutes = duration.minutes();
		const seconds = duration.seconds();

		if (months >= 1) {
			return `${months}m`;
		} else if (weeks >= 1) {
			return `${weeks}w`;
		} else if (days >= 1) {
			return `${days}d`;
		} else {
			return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
		}
	}

	return (
		<Frame className="overflow-hidden pb-3">
			{sessionInfo ? (
				<>
					<div className="mb-4 flex items-center justify-between">
						<div className="flex items-center font-bold" title="Session ID">
							<div className="mr-1">{sessionInfo.sessionId}</div>
							<CopyButton size="sm" text={sessionInfo.sessionId} />
						</div>

						<div className="flex items-center font-bold" title="Created">
							<ReactTimeAgo date={sessionInfo.createdAt} locale="en-US" />

							<IconButton
								ariaLabel={t("buttons.ariaCloseEditor")}
								className="relative -right-4 -top-3 h-7 w-7 bg-gray-1100 p-0.5"
								onClick={closeEditor}
							>
								<Close className="h-3 w-3 fill-white transition" />
							</IconButton>
						</div>
					</div>
					<div className="flex gap-6">
						<div className="flex w-1/4 flex-col gap-2">
							{sessionInfo.state === SessionState.completed ||
							sessionInfo.state === SessionState.error ? (
								<>
									<div className="flex items-center gap-2">
										<div className="w-3/5">Status</div>
										<div className="w-full">
											<SessionsTableState
												className="font-semibold"
												sessionState={sessionInfo.state}
											/>
										</div>
									</div>
									<div className="flex items-center gap-2 font-semibold">
										<div className="w-3/5" title="Start Time">
											{moment(sessionInfo.createdAt).format("HH:mm:ss")}
										</div>
										<div className="flex w-full flex-row items-center">
											<IconSvg className="mr-2 fill-white" size="sm" src={ArrowRightIcon} />

											<div title="End Time">
												{moment(sessionInfo.updatedAt).format("HH:mm:ss")}
											</div>
										</div>
									</div>

									<div className="flex items-center gap-2">
										<div className="w-3/5">Duration</div>
										<div className="w-full font-semibold">
											{formatTimeDifference(sessionInfo.updatedAt, sessionInfo.createdAt)}
										</div>
									</div>
								</>
							) : (
								<>
									<div className="flex items-center gap-2">
										<div className="w-3/5">Status</div>
										<div className="w-full">
											<SessionsTableState
												className="font-semibold"
												sessionState={sessionInfo.state}
											/>
										</div>
									</div>
									<div className="flex items-center gap-2 font-semibold">
										<div className="w-3/5" title="Start Time">
											{moment(sessionInfo.createdAt).format("HH:mm:ss")}
										</div>
										<div className="flex w-full flex-row items-center">
											<IconSvg className="mr-2 fill-white" size="sm" src={ArrowRightIcon} />

											<SessionsTableState
												className="font-semibold"
												sessionState={sessionInfo.state}
											/>
										</div>
									</div>

									<div className="flex items-center gap-2">
										<div className="w-3/5">Duration</div>
										<div className="w-full font-semibold">
											<ReactTimeAgo
												date={sessionInfo.createdAt}
												locale="en-US"
												timeStyle="mini"
											/>
										</div>
									</div>
								</>
							)}
						</div>

						<div className="flex w-1/2 flex-col gap-2">
							{sessionInfo?.connectionName ? (
								<div className="flex items-center gap-2">
									<div className="w-1/3">{t("connectionName")}</div>
									<span className="font-semibold">{sessionInfo.connectionName}</span>
								</div>
							) : null}

							{sessionInfo?.triggerName ? (
								<div className="flex items-center gap-2">
									<div className="w-1/3">{t("trigger")}</div>
									<span className="font-semibold">{sessionInfo.triggerName}</span>
								</div>
							) : null}

							<div className="flex items-center gap-2">
								{t("entrypoint")}:
								<div className="inline font-semibold">
									<div className="inline">{sessionInfo.entrypoint.path}</div>
									<IconSvg className="mx-2 inline fill-white" size="sm" src={ArrowRightIcon} />
									<div className="inline">{sessionInfo.entrypoint.name}</div>
								</div>
							</div>
						</div>

						<div className="ml-auto flex w-auto flex-col gap-2">
							<div className="flex items-center gap-2">
								<div>{t("eventId")}</div>
								<CopyButton size="sm" text={sessionInfo.eventId} />
							</div>
							<div className="flex items-center gap-2">
								<div>{t("buildId")}</div>
								<CopyButton size="sm" text={sessionInfo.buildId} />
							</div>
						</div>
					</div>
				</>
			) : null}
			{sessionInfo?.inputs ? (
				<Accordion className="mb-4 mt-6" title="Inputs">
					<JsonView
						className="scrollbar max-h-72 overflow-auto"
						style={githubDarkTheme}
						value={sessionInfo.inputs}
					/>
				</Accordion>
			) : null}
			<div className="mt-4 flex items-center justify-between">
				<div className="scrollbar flex items-center gap-2 overflow-x-auto overflow-y-hidden whitespace-nowrap uppercase xl:gap-4 2xl:gap-6">
					{sessionTabs.map((singleTab) => (
						<Tab
							activeTab={activeTab}
							ariaLabel={singleTab.label}
							className="p-0"
							key={singleTab.value}
							onClick={() => goTo(singleTab.value)}
							value={singleTab.value}
						>
							{singleTab.label}
						</Tab>
					))}
				</div>

				{sessionInfo ? <RefreshButton isLoading={isLoading} onRefresh={fetchSessions} /> : null}
			</div>
			<Outlet />
			<LogoCatLarge />
		</Frame>
	);
};
