import React from "react";
import { router } from "@routing/routes";
import { RouterProvider } from "react-router-dom";

export const App = () => {
	return <RouterProvider router={router} />;
};
