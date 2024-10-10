import React from "react";

import { useTranslation } from "react-i18next";
import { matchPath, useLocation } from "react-router-dom";

import { menuItems } from "@constants";
import { cn } from "@src/utilities";

import { Button, IconSvg } from "@components/atoms";

export const SettingsMenu = () => {
	const { t } = useTranslation("settings");
	const location = useLocation();

	return (
		<div className="flex h-full flex-1 flex-col rounded-l-lg bg-black pl-6 pt-8 text-lg">
			{menuItems.map((item, index) => {
				const isCurrentPage = matchPath({ path: item.path, end: true }, location.pathname);

				const settingsMenuButtonClass = cn(
					"group mb-4 mr-2 flex cursor-pointer items-center text-white active:bg-black active:text-green-800",
					{
						"bg-gray-950": isCurrentPage,
					}
				);

				return (
					<Button className={settingsMenuButtonClass} href={item.path} key={index}>
						<div className="mr-2 rounded-full bg-gray-950 p-2">
							<IconSvg className="fill-white group-hover:fill-green-800" src={item.icon} />
						</div>
						<div>{t(item.label)}</div>
					</Button>
				);
			})}
		</div>
	);
};
