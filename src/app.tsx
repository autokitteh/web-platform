import React from "react";
import { router } from "@routing/routes";
import { RouterProvider } from "react-router-dom";

export const App: React.FC = () => <RouterProvider router={router} />;
