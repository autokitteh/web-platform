import React from "react";

import { useTranslation } from "react-i18next";
import { matchPath, useLocation } from "react-router-dom";

import { userMenuItems, userMenuOrganizationItems } from "@constants";
import { cn } from "@src/utilities";

import { Button, IconSvg } from "@components/atoms";

export const SettingsMenu = ({ variant }: { variant: "userSettings" | "organization" }) => {
	const { t } = useTranslation("settings");
	const location = useLocation();

	const currentMenuItems = variant === "organization" ? userMenuOrganizationItems : userMenuItems;

	return (
		<div className="flex h-full max-w-72 flex-1 flex-col rounded-l-2xl bg-black pl-7 pt-6 text-lg">
			{currentMenuItems.map(({ href, icon, label, stroke }, index) => {
				const isCurrentPage = matchPath({ path: href, end: true }, location.pathname);

				const settingsMenuButtonClass = cn(
					"group mb-5 flex items-center text-white active:text-green-800 p-0 hover:bg-transparent gap-2 font-averta",
					{
						"font-bold": isCurrentPage,
					}
				);

				const parentIconClass = cn(
					"flex size-7.5 items-center justify-center rounded-full group-hover:bg-gray-950",
					{
						"bg-green-800": isCurrentPage,
					}
				);
				const iconClass = cn("fill-white group-hover:fill-white", {
					"fill-black": isCurrentPage,
					"stroke-white fill-transparent group-hover:fill-transparent group-hover:stroke-white": stroke,
					"stroke-black": stroke && isCurrentPage,
				});

				return (
					<Button className={settingsMenuButtonClass} href={href} key={index}>
						<div className={parentIconClass}>
							<IconSvg className={iconClass} src={icon} />
						</div>
						{t(label)}
					</Button>
				);
			})}
		</div>
	);
};
