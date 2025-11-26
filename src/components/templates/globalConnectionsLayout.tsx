import React from "react";

import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";

import { SystemLogLayout } from "./systemLogLayout";

import { LogoCatLarge } from "@components/atoms";
import { Sidebar, TitleTopbar } from "@components/organisms";

export const GlobalConnectionsLayout = () => {
	const { t } = useTranslation("connections", { keyPrefix: "topbar" });

	return (
		<SystemLogLayout sidebar={<Sidebar />} topbar={<TitleTopbar title={t("title")} />}>
			<div className="relative size-full overflow-hidden pt-1.5">
				<Outlet />

				<div className="absolute -bottom-5 -right-5">
					<LogoCatLarge />
				</div>
			</div>
		</SystemLogLayout>
	);
};
