import React from "react";

import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";

import { SystemLogLayout } from "./systemLogLayout";

import { LogoCatLarge } from "@components/atoms";
import { Sidebar, TitleTopbar } from "@components/organisms";

export const EventsLayout = () => {
	const { t } = useTranslation("events", { keyPrefix: "topbar" });

	return (
		<SystemLogLayout sidebar={<Sidebar />} topbar={<TitleTopbar title={t("title")} />}>
			<div className="relative size-full overflow-hidden pt-1.5">
				<Outlet />

<<<<<<< HEAD
				<div className="absolute -bottom-5 -right-5">
					<LogoCatLarge />
=======
				<div className="flex flex-1 flex-col">
					<TitleTopbar title={t("title")} />

					<div className="relative my-2 flex size-full overflow-hidden rounded-2xl">
						<Outlet />

						<div className="absolute -bottom-5 -right-5">
							<LogoCatLarge />
						</div>
					</div>
>>>>>>> 4d4d633d (feat(UI-1019): refactor events routing and enhance drawer functionality)
				</div>
			</div>
		</SystemLogLayout>
	);
};
