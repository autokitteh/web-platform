import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { Outlet, useLocation } from "react-router-dom";

import { LogoCatLarge, PageTitle } from "@components/atoms";
import { Sidebar, TitleTopbar } from "@components/organisms";
import { SettingsMenu } from "@components/organisms/settings";

export const SettingsLayout = () => {
	const { t: tSettings } = useTranslation("settings", { keyPrefix: "topbar" });
	const { t } = useTranslation("global", { keyPrefix: "pageTitles" });
	const [pageTitle, setPageTitle] = useState<string>(t("base"));
	const { pathname } = useLocation();

	const subPageTitles: Record<string, string> = {
		"/settings": tSettings("personalSettings"),
		"/settings/client-configuration": tSettings("personalSettings"),
	};

	const topbarTitle = subPageTitles[pathname] ? subPageTitles[pathname] : "";

	useEffect(() => {
		setPageTitle(t("template", { page: t("settings") }));

		return () => setPageTitle(t("base"));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<PageTitle title={pageTitle} />

			<div className="h-screen w-screen pr-5">
				<div className="flex size-full">
					<Sidebar />

					<div className="flex flex-1 flex-col">
						<TitleTopbar title={topbarTitle} />

						<div className="relative flex size-full overflow-hidden py-2">
							<SettingsMenu />
							<div className="scrollbar flex h-full flex-5 flex-col overflow-y-auto rounded-r-2xl border-l bg-gray-1100 pl-6 pt-6">
								<Outlet />

								<div className="absolute !-bottom-5 !-right-5">
									<LogoCatLarge />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
