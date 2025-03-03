import React from "react";

import { Outlet } from "react-router-dom";

import { SystemLogLayout } from "./systemLogLayout";

import { LogoCatLarge } from "@components/atoms";

export const EventsLayout = () => {
	return (
		<SystemLogLayout>
			<div className="relative size-full overflow-hidden pt-1.5">
				<Outlet />

				<div className="absolute -bottom-5 -right-5">
					<LogoCatLarge />
				</div>
			</div>
		</SystemLogLayout>
	);
};
