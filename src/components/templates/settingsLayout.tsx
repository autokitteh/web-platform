import React from "react";

import { Outlet } from "react-router-dom";

import { LogoCatLarge } from "@components/atoms";
import { Sidebar } from "@components/organisms";
import { SettingsMenu, SettingsTopbar } from "@components/organisms/settings";

export const SettingsLayout = () => {
	return (
		<div className="h-screen pr-5 w-screen">
			<div className="flex h-full w-full">
				<Sidebar />

				<div className="flex flex-col transition w-full">
					<SettingsTopbar />

					<div className="flex h-full overflow-hidden py-4 relative w-full">
						<SettingsMenu />

						<div className="bg-gray-800 flex flex-5 flex-col h-full pl-6 pt-10 rounded-br-lg rounded-tr-lg w-1/3">
							<Outlet />

							<div className="!-bottom-5 !-right-5 absolute">
								<LogoCatLarge />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
