import React, { ReactElement } from "react";
import { Home, SignIn, NewConnection, Project } from "@components/pages";
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
		path: ":projectId",
		children: [
			{
				path: "new-connection",
				element: <NewConnection />,
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
