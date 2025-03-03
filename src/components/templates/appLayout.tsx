import React from "react";

import { Outlet } from "react-router-dom";

import { SystemLogLayout } from "./systemLogLayout";

export const AppLayout = () => {
	return (
		<SystemLogLayout>
			<Outlet />
		</SystemLogLayout>
	);
};
