import React, { ReactElement } from "react";
import {
	NewConnection,
	NewTrigger,
	ModifyTrigger,
	NewVariable,
	ModifyVariable,
	Project,
	Sessions,
	Dashboard,
	DeploymentsHistory,
} from "@components/pages";
import { AppLayout, MapMenuFrameLayout } from "@components/templates";
import { SidebarHrefMenu } from "@enums/components";
import { createBrowserRouter, RouteObject } from "react-router-dom";

export const router = createBrowserRouter([
	{
		path: "/",
		element: (
			<AppLayout>
				<Dashboard />
			</AppLayout>
		),
	},
	{
		path: `/${SidebarHrefMenu.projects}/:projectId`,
		children: [
			{
				path: "add-new-connection",
				element: (
					<AppLayout displayTopbar>
						<MapMenuFrameLayout>
							<NewConnection />
						</MapMenuFrameLayout>
					</AppLayout>
				),
			},
			{
				path: "add-new-trigger",
				element: (
					<AppLayout displayTopbar>
						<MapMenuFrameLayout>
							<NewTrigger />
						</MapMenuFrameLayout>
					</AppLayout>
				),
			},
			{
				path: "modify-trigger/:triggerId",
				element: (
					<AppLayout displayTopbar>
						<MapMenuFrameLayout>
							<ModifyTrigger />
						</MapMenuFrameLayout>
					</AppLayout>
				),
			},
			{
				path: "add-new-variable",
				element: (
					<AppLayout displayTopbar>
						<MapMenuFrameLayout>
							<NewVariable />
						</MapMenuFrameLayout>
					</AppLayout>
				),
			},
			{
				path: "modify-variable/:environmentId/:variableName",
				element: (
					<AppLayout displayTopbar>
						<MapMenuFrameLayout>
							<ModifyVariable />
						</MapMenuFrameLayout>
					</AppLayout>
				),
			},
			{
				path: "",
				element: (
					<AppLayout displayTopbar>
						<Project />
					</AppLayout>
				),
			},
			{
				path: "deployments",
				element: (
					<AppLayout displayStatsTopbar>
						<DeploymentsHistory />
					</AppLayout>
				),
			},
			{
				path: "deployments/:deploymentId",
				element: (
					<AppLayout displayStatsTopbar>
						<Sessions />
					</AppLayout>
				),
			},
			{
				path: "deployments/:deploymentId/:sessionId",
				element: (
					<AppLayout displayStatsTopbar>
						<Sessions />
					</AppLayout>
				),
			},
		],
	},
	{
		path: "*",
		element: (
			<p className="text-black text-center text-xl font-semibold">There&apos;s nothing here: 404!</p>
		) as ReactElement,
	},
] as RouteObject[]);
