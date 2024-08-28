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
import { ViewerSession } from "@src/types/models/session.type";

import { Frame, IconButton, IconSvg, LogoCatLarge, Tab } from "@components/atoms";
import { Accordion } from "@components/molecules";
import { SessionsTableState } from "@components/organisms/deployments";

import { ArrowRightIcon, Close, CopyIcon } from "@assets/image/icons";

const example = {
	string: "Lorem ipsum dolor sit amet",
	integer: 42,
	float: 114.514,
	bigint: 10086n,
	null: null,
	undefined,
	timer: 0,
	date: new Date("Tue Sep 13 2022 14:07:44 GMT-0500 (Central Daylight Time)"),
	array: [19, 100.86, "test", NaN, Infinity],
	nestedArray: [
		[1, 2],
		[3, 4],
	],
	object: {
		"first-child": true,
		"second-child": false,
		"last-child": null,
	},
	string_number: "1234",
};

export const SessionViewer = () => {
	const { deploymentId, projectId, sessionId } = useParams();
	const { t } = useTranslation("deployments", { keyPrefix: "sessions" });
	const navigate = useNavigate();
	const location = useLocation();
	const [activeTab, setActiveTab] = useState(defaultSessionTab);
	const [sessionInfo, setSessionInfo] = useState<ViewerSession>();
	const closeEditor = () => navigate(`/projects/${projectId}/deployments/${deploymentId}/sessions`);

	useEffect(() => {
		const pathParts = location.pathname.split("/").filter(Boolean);
		const activeTabIndex = pathParts[6] || defaultSessionTab;
		setActiveTab(activeTabIndex);
	}, [location]);

	const fetchSessionInfo = async () => {
		const { data: sessionInfoResponse } = await SessionsService.getSessionInfo(sessionId!);
		setSessionInfo(sessionInfoResponse);
	};

	useEffect(() => {
		fetchSessionInfo();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const goTo = (path: string) => {
		if (path === defaultSessionTab) {
			navigate("");

			return;
		}
		navigate(path.toLowerCase());
	};

	function formatTimeDifference(endDate: Date, stardDate: Date) {
		// Calculate the duration between two dates
		const duration = moment.duration(moment(endDate).diff(moment(stardDate)));

		const months = Math.floor(duration.asMonths());
		const weeks = Math.floor(duration.asWeeks());
		const days = Math.floor(duration.asDays());
		const hours = duration.hours();
		const minutes = duration.minutes();
		const seconds = duration.seconds();

		// Determine the format based on the duration
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
		<Frame className="h-full w-full overflow-hidden pb-3 transition">
			{sessionInfo ? (
				<>
					<div className="flex items-center justify-between">
						<div className="font-bold" title="Trigger name">
							{sessionInfo.sessionId}
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
					<div className="mt-1 flex justify-between">
						<div className="flex flex-col gap-1">
							{sessionInfo.state === SessionState.completed ||
							sessionInfo.state === SessionState.error ? (
								<>
									<div className="flex items-center gap-1">
										Status:
										<SessionsTableState
											className="font-semibold"
											sessionState={sessionInfo.state}
										/>
									</div>
									<div className="flex items-center gap-2 font-semibold">
										<div title="Start Time">{moment(sessionInfo.createdAt).format("HH:mm:ss")}</div>

										<IconSvg className="fill-white" size="sm" src={ArrowRightIcon} />

										<div title="End Time">{moment(sessionInfo.updatedAt).format("HH:mm:ss")}</div>
									</div>

									<div className="flex items-center gap-1">
										Duration:
										<div className="font-semibold">
											{formatTimeDifference(sessionInfo.updatedAt, sessionInfo.createdAt)}
										</div>
									</div>
								</>
							) : (
								<>
									<div className="flex items-center gap-1">
										Status:
										<SessionsTableState
											className="font-semibold"
											sessionState={sessionInfo.state}
										/>
									</div>
									<div className="flex items-center gap-2 font-semibold">
										<div title="Start Time">{moment(sessionInfo.createdAt).format("HH:mm:ss")}</div>

										<IconSvg className="fill-white" size="sm" src={ArrowRightIcon} />

										<SessionsTableState
											className="font-semibold"
											sessionState={sessionInfo.state}
										/>
									</div>

									<div className="flex items-center gap-1">
										Duration:
										<div className="font-semibold">
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

						<div className="flex flex-col gap-1">
							<div>
								Connection name: <span className="font-semibold">{sessionInfo.connectionName}</span>
							</div>

							<div>
								Trigger name: <span className="font-semibold">{sessionInfo.triggerName}</span>
							</div>

							<div>
								Entrypoint:{" "}
								<div className="inline font-semibold">
									<div className="inline">{sessionInfo.entrypoint.path}</div>

									<IconSvg className="inline fill-white" size="sm" src={ArrowRightIcon} />

									<div className="inline">{sessionInfo.entrypoint.name}</div>
								</div>
							</div>
						</div>

						<div className="flex flex-col gap-1">
							<div>
								Event ID:
								<IconButton className="inline" title="evt_01j55bpx8pepjv8vk4bxwx2hnr">
									<CopyIcon className="h-3 w-3 fill-white" />
								</IconButton>
							</div>

							<div>
								Build ID:
								<IconButton className="inline" title="bld_01j53hcjq6ecqamda2qq3n8wdx">
									<CopyIcon className="h-3 w-3 fill-white" />
								</IconButton>
							</div>
						</div>
					</div>
				</>
			) : null}

			<Accordion className="mt-2" title="Trigger Inputs">
				<JsonView className="scrollbar max-h-72 overflow-auto" style={githubDarkTheme} value={example} />
			</Accordion>

			<div className="mt-2 flex items-center justify-between">
				<div
					className={
						`flex items-center gap-1 uppercase xl:gap-2 2xl:gap-4 3xl:gap-5 ` +
						`scrollbar overflow-x-auto overflow-y-hidden whitespace-nowrap`
					}
				>
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
			</div>
			<Outlet />
			<LogoCatLarge />
		</Frame>
	);
};
