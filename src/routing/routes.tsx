import React, { ReactElement } from "react";
import { Home, SignIn, NewConnection } from "@components/pages";
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
		path: "app/new-connection",
		element: <NewConnection />,
	},
	{
		path: "*",
		element: (<p>There&apos;s nothing here: 404!</p>) as ReactElement,
	},
] as RouteObject[]);
