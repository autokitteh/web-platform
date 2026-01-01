import React, { useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import { Outlet, useLocation } from "react-router-dom";

import { SystemLogLayout } from "./systemLogLayout";
import { getUserMenuOrganizationItems, userMenuItems } from "@constants";
import { useOrganizationStore } from "@src/store";

import { LogoCatLarge } from "@components/atoms";
import { Sidebar, TitleTopbar } from "@components/organisms";
import { SettingsMenu } from "@components/organisms/settings";

export const SettingsLayout = () => {
	const { t } = useTranslation("settings", { keyPrefix: "topbar" });
	const { pathname } = useLocation();
	const { currentOrganization, getCurrentOrganizationEnriched } = useOrganizationStore();
	const { user } = useOrganizationStore();

	const getTopbarTitle = () =>
		pathname.startsWith("/settings")
			? t("personalSettings", { name: user?.name })
			: t("organizationSettings", { name: currentOrganization?.displayName });

	const [settingsTitle, setSettingsTitle] = useState<string>(getTopbarTitle());

	useEffect(() => {
		setSettingsTitle(getTopbarTitle());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, pathname]);
	const userMenuOrganizationItems = useMemo(() => {
		const { data: currentOrganization } = getCurrentOrganizationEnriched();
		if (!currentOrganization?.currentMember) return [];
		return getUserMenuOrganizationItems(currentOrganization.currentMember.role);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	const menuItems = pathname.startsWith("/settings") ? userMenuItems : userMenuOrganizationItems;

	return (
		<div className="h-screen">
			<div className="mt-1 flex size-full">
				<Sidebar />
				<SystemLogLayout>
					<div className="flex h-full flex-1 flex-col">
						<TitleTopbar title={settingsTitle} />

						<div className="relative flex size-full overflow-hidden pt-2">
							<SettingsMenu menu={menuItems} />

							<div className="scrollbar flex h-full flex-5 flex-col overflow-y-auto rounded-r-2xl border-l bg-gray-1100 px-9 pt-6">
								<Outlet />

								<div className="absolute !-bottom-5 !-right-5">
									<LogoCatLarge />
								</div>
							</div>
						</div>
					</div>
				</SystemLogLayout>
			</div>
		</div>
	);
};
