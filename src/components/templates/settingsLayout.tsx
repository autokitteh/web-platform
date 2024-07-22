import React from "react";

import { Outlet } from "react-router-dom";

import { LogoCatLarge } from "@components/atoms";
import { Sidebar } from "@components/organisms";
import { SettingsMenu, SettingsTopbar } from "@components/organisms/settings";

export const SettingsLayout = () => {
	return (
		<div className="h-screen w-screen pr-5">
			<div className="flex h-full w-full">
				<Sidebar />

				<div className="flex w-full flex-col transition">
					<SettingsTopbar />

					<div className="relative flex h-full w-full overflow-hidden py-4">
						<SettingsMenu />

						<div className="flex h-full w-1/3 flex-5 flex-col rounded-br-lg rounded-tr-lg bg-gray-1250 pl-6 pt-10">
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
