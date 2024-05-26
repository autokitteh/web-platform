import React, { ReactElement } from "react";
import {
	NewConnection,
	NewTrigger,
	ModifyTrigger,
	NewVariable,
	ModifyVariable,
	Project,
	Deployments,
	Sessions,
	Dashboard,
	Logout,
} from "@components/pages";
import { SidebarHrefMenu } from "@enums/components";
import { createBrowserRouter, RouteObject } from "react-router-dom";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <Dashboard />,
	},
	{
		path: "/logout",
		element: <Logout />,
	},
	{
		path: `/${SidebarHrefMenu.projects}/:projectId`,
		children: [
			{
				path: "add-new-connection",
				element: <NewConnection />,
			},
			{
				path: "add-new-trigger",
				element: <NewTrigger />,
			},
			{
				path: "modify-trigger/:triggerId",
				element: <ModifyTrigger />,
			},
			{
				path: "add-new-variable",
				element: <NewVariable />,
			},
			{
				path: "modify-variable/:environmentId/:variableName",
				element: <ModifyVariable />,
			},
			{
				path: "",
				element: <Project />,
			},
			{
				path: "deployments",
				element: <Deployments />,
			},
			{
				path: "deployments/:deploymentId",
				element: <Sessions />,
			},
			{
				path: "deployments/:deploymentId/:sessionId",
				element: <Sessions />,
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
