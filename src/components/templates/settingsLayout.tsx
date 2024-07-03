import React from "react";
import { LogoCatLarge } from "@components/atoms";
import { Sidebar } from "@components/organisms";
import { SettingsMenu, SettingsTopbar } from "@components/organisms/settings";
import { Outlet } from "react-router-dom";

export const SettingsLayout = () => {
	return (
		<div className="w-screen h-screen pr-5">
			<div className="flex h-full w-full">
				<Sidebar />
				<div className="flex flex-col transition w-full">
					<SettingsTopbar />
					<div className="h-full w-full flex py-4 relative overflow-hidden">
						<SettingsMenu />
						<div className="flex flex-col bg-gray-800 flex-5 rounded-tr-lg rounded-br-lg pt-10 pl-6 w-1/3 h-full">
							<Outlet />
							<div className="absolute !-bottom-5 !-right-5">
								<LogoCatLarge />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
