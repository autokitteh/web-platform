import React from "react";

import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";

import { LogoCatLarge } from "@components/atoms";
import { Sidebar } from "@components/organisms";
import { TitleTopbar } from "@components/organisms/settings";

export const EventsLayout = () => {
	const { t } = useTranslation("events", { keyPrefix: "topbar" });

	return (
		<div className="h-screen w-screen pr-5">
			<div className="flex size-full">
				<Sidebar />

				<div className="flex w-full flex-col transition">
					<TitleTopbar title={t("title")} />

					<div className="relative flex size-full overflow-hidden py-4">
						<Outlet />

						<div className="absolute !-bottom-5 !-right-5">
							<LogoCatLarge />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
