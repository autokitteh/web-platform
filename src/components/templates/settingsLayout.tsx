import React from "react";
import { Sidebar } from "@components/organisms";
import { SettingsTopbar } from "@components/organisms/settings";
import { Outlet } from "react-router-dom";

export const SettingsLayout = () => {
	return (
		<div className="w-screen h-screen pr-5">
			<div className="flex h-full w-full">
				<Sidebar />
				<div className="flex flex-col overflow-auto pl-7 -ml-7 transition w-full">
					<SettingsTopbar />
					<div className="pb-2.5 w-full">
						<div className="h-full">
							<div className="flex h-full gap-6">
								<Outlet />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
