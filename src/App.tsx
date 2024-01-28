import React from "react";
import { RouterProvider } from "react-router-dom";

import { router } from "./routing/Routes";

export const App = () => {
	return <RouterProvider router={router} />;
};
