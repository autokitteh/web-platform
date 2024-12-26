import React from "react";

import { Outlet } from "react-router-dom";

import { EventsDrawer } from "@components/organisms";

export const Connections = () => {
	return (
		<>
			<Outlet />
			<EventsDrawer />
		</>
	);
};
