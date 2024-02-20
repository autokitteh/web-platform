import React, { ReactElement } from "react";
import { Home, SignIn } from "@components/pages";
import { createBrowserRouter, RouteObject } from "react-router-dom";

export const router = createBrowserRouter([
	{
		path: "app",
		element: <Home />,
	},
	{
		path: "signin",
		element: <SignIn />,
	},
	{
		path: "*",
		element: (<p>There&apos;s nothing here: 404!</p>) as ReactElement,
	},
] as RouteObject[]);
