import React from "react";
import { ProjectsService } from "./services";
import { router } from "@routing/routes";
import { RouterProvider } from "react-router-dom";

export const App = () => {
	console.log(ProjectsService.list());
	return <RouterProvider router={router} />;
};
