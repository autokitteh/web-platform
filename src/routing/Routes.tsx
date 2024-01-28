import React, { ReactElement } from "react";
import { createBrowserRouter, RouteObject } from "react-router-dom";
import { Home } from "@components/pages";

export const router = createBrowserRouter([
	{
		path: "app",
		element: <Home />,
	},
	{
		path: "*",
		element: (<p>There&apos;s nothing here: 404!</p>) as ReactElement,
	},
] as RouteObject[]);
