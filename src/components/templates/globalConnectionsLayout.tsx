import React from "react";

import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";

import { SystemLogLayout } from "./systemLogLayout";
import { useGlobalConnectionsStore } from "@src/store";

import { LogoCatLarge } from "@components/atoms";
import { Sidebar, TitleTopbar } from "@components/organisms";

export const GlobalConnectionsLayout = () => {
	const { t } = useTranslation("connections", { keyPrefix: "globalConnections" });
	const { globalConnections } = useGlobalConnectionsStore();

	const title = `${t("title", { count: globalConnections.length })}`;
	return (
		<SystemLogLayout sidebar={<Sidebar />} topbar={<TitleTopbar title={title} />}>
			<div className="relative size-full overflow-hidden pt-1.5">
				<Outlet />

				<div className="absolute -bottom-5 -right-5">
					<LogoCatLarge />
				</div>
			</div>
		</SystemLogLayout>
	);
};
