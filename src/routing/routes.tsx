import React, { ReactElement } from "react";
import { Home, SignIn, NewConnection, NewTrigger, Project } from "@components/pages";
import { ESidebarHrefMenu } from "@enums/components";
import { createBrowserRouter, RouteObject } from "react-router-dom";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <Home />,
	},
	{
		path: "signin",
		element: <SignIn />,
	},
	{
		path: `/${ESidebarHrefMenu.myProjects}/:projectId`,
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
				path: "",
				element: <Project />,
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
