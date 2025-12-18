import React from "react";

import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";

import { SystemLogLayout } from "./systemLogLayout";
import { useOrgConnectionsStore } from "@src/store";

import { LogoCatLarge } from "@components/atoms";
import { Sidebar } from "@components/organisms";
import { OrgConnectionsTableTitle } from "@components/organisms/orgConnections";

export const OrgConnectionsLayout = () => {
	const { t } = useTranslation("connections", { keyPrefix: "orgConnections" });
	const { orgConnections } = useOrgConnectionsStore();

	const title = `${t("title", { count: orgConnections.length })}` || "Org Connections";
	return (
		<SystemLogLayout sidebar={<Sidebar />} topbar={<OrgConnectionsTableTitle title={title} />}>
			<div className="relative size-full overflow-hidden pt-1.5">
				<Outlet />

				<div className="absolute -bottom-5 -right-5">
					<LogoCatLarge />
				</div>
			</div>
		</SystemLogLayout>
	);
};
