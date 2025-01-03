import React from "react";

import { Outlet } from "react-router-dom";

import { EventsDrawer } from "@components/organisms";

export const Triggers = () => {
	return (
		<>
			<Outlet />
			<EventsDrawer />
		</>
	);
};
