import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { communityProjectTabs, defaultCommunityProjectTab } from "@constants";

import { Frame, IconSvg, SearchInput, Tab, Typography } from "@components/atoms";

import { ArrowZigzagIcon } from "@assets/image/icons";

export const CommunityProjects = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "comunityProjects" });
	const navigate = useNavigate();
	const location = useLocation();
	const [activeTab, setActiveTab] = useState<string>();

	useEffect(() => {
		const pathParts = location.pathname.split("/").filter(Boolean);
		const activeTabIndex = pathParts[2];
		setActiveTab(activeTabIndex || defaultCommunityProjectTab);
	}, [location]);

	const goTo = (path: string) => {
		navigate(path.toLowerCase());
	};

	return (
		<Frame className="w-1/3 rounded-none bg-gray-black-300">
			<Typography
				className="font-averta-bold flex w-full items-center gap-3 text-3xl font-semibold text-black"
				element="h2"
			>
				<IconSvg size="2xl" src={ArrowZigzagIcon} />

				{t("title")}
			</Typography>

			<SearchInput className="my-7 h-16 rounded-3xl bg-transparent" placeholder="Explore" variant="light" />

			<div className="flex h-full flex-1 flex-col">
				<div className="sticky -top-8 z-20 -mt-5 bg-gray-black-300 pb-0 pt-3">
					<div
						className={
							"flex select-none items-center gap-1 xl:gap-4 2xl:gap-5 3xl:gap-6 " +
							"scrollbar shrink-0 overflow-x-auto overflow-y-hidden whitespace-nowrap py-2"
						}
					>
						{communityProjectTabs.map((singleTab) => (
							<Tab
								activeTab={activeTab}
								ariaLabel={singleTab.label}
								className="border-b-4 pb-0 text-lg normal-case"
								key={singleTab.value}
								onClick={() => goTo(singleTab.value)}
								value={singleTab.value}
								variant="dark"
							>
								{singleTab.label}
							</Tab>
						))}
					</div>
				</div>

				<div className="h-full">
					<Outlet />
				</div>
			</div>
		</Frame>
	);
};
