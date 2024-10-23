import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";

import { LogoCatLarge, PageTitle } from "@components/atoms";
import { Sidebar, TitleTopbar } from "@components/organisms";
import { SettingsMenu } from "@components/organisms/settings";

export const SettingsLayout = () => {
	const { t } = useTranslation("global", { keyPrefix: "pageTitles" });
	const [pageTitle, setPageTitle] = useState<string>(t("base"));
	const { t: tSettings } = useTranslation("settings", { keyPrefix: "topbar" });

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

					<div className="flex w-full flex-col">
						<TitleTopbar title={tSettings("title")} />

						<div className="relative flex size-full overflow-hidden py-2">
							<SettingsMenu />

							<div className="flex h-full w-1/3 flex-5 flex-col rounded-r-2xl bg-gray-1250 pl-6 pt-10">
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
