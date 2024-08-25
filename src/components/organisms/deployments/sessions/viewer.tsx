import React, { useEffect, useState } from "react";

import JsonView from "@uiw/react-json-view";
import { githubDarkTheme } from "@uiw/react-json-view/githubDark";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";

import { defaultSessionTab, sessionTabs } from "@constants";
import { SessionsService } from "@services/sessions.service";
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
	}, []);

	const goTo = (path: string) => {
		if (path === defaultSessionTab) {
			navigate("");

			return;
		}
		navigate(path.toLowerCase());
	};

	return (
		<Frame className="ml-2.5 w-2/4 transition">
			<div className="flex items-center justify-between">
				<div className="font-bold" title="Trigger name">
					ses_01j5qf52n2es6v5see1f69pwm1
				</div>

				<div className="flex items-center font-bold" title="Created">
					3 days ago
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
					<div className="flex items-center gap-1">
						Status: <SessionsTableState className="font-semibold" sessionState={4} />
					</div>

					<div className="flex items-center gap-2 font-semibold">
						<div title="Start Time"> {moment().format("HH:mm:ss")}</div>

						<IconSvg className="fill-white" size="sm" src={ArrowRightIcon} />

						<div title="Start Time"> {moment().format("HH:mm:ss")}</div>
					</div>

					<div>
						Duration: <span className="font-semibold">35s</span>
					</div>
				</div>

				<div className="flex flex-col gap-1">
					<div>
						Connection name: <span className="font-semibold">MySlack</span>
					</div>

					<div>
						Trigger name: <span className="font-semibold">slack_slash_command</span>
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
