import React, { useEffect, useState } from "react";

import JsonView from "@uiw/react-json-view";
import { githubDarkTheme } from "@uiw/react-json-view/githubDark";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";

import { defaultSessionTab, sessionTabs } from "@constants";

import { Frame, IconButton, LogoCatLarge, Tab } from "@components/atoms";
import { Accordion } from "@components/molecules";
import { SessionsTableState } from "@components/organisms/deployments";

import { Close } from "@assets/image/icons";

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

	const closeEditor = () => navigate(`/projects/${projectId}/deployments/${deploymentId}/sessions`);

	useEffect(() => {
		const pathParts = location.pathname.split("/").filter(Boolean);
		const activeTabIndex = pathParts[6] || defaultSessionTab;
		setActiveTab(activeTabIndex);
	}, [location]);

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
				<div className="text-lg" title="Session ID">
					{sessionId}
				</div>

				<div className="flex items-center" title="Created">
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
						Current status: <SessionsTableState sessionState={4} />
					</div>

					<div>
						Start time: <span>{new Date().toLocaleDateString("en-GB")}</span>
					</div>

					<div>
						End time: <span>{new Date().toLocaleDateString("en-GB")}</span>
					</div>
				</div>

				<div className="flex flex-col gap-1">
					<div>Connection name: MyGitHub</div>

					<div>Event Type: Type</div>

					<div>Build ID: bld_01j53hcjq6ecqamda2qq3n8wdx</div>
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
