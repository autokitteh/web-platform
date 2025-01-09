import React from "react";

import { Navigate } from "react-router-dom";

import { useUserStore } from "@src/store";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
	const user = useUserStore((state) => state.user);

	if (user?.role === undefined) {
		return <Navigate replace to="/404" />;
	}

	return children;
};
