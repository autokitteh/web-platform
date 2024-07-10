import React from "react";

import { useTranslation } from "react-i18next";

import { menuItems } from "@constants";

import { IconSvg } from "@components/atoms";

export const SettingsMenu = () => {
	const { t } = useTranslation("settings");

	return (
		<div className="flex h-full flex-1 flex-col rounded-bl-lg rounded-tl-lg bg-black pl-6 pt-10 text-lg">
			{menuItems.map((item, index) => (
				<div className="group mb-4 flex cursor-pointer items-center" key={index} role="link">
					<div className="mr-2 rounded-full bg-gray-500 p-2">
						<IconSvg className="fill-white group-hover:fill-green-accent" size="sm" src={item.icon} />
					</div>

					<div>{t(item.label)}</div>
				</div>
			))}
		</div>
	);
};
