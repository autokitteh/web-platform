import React from "react";

import { useTranslation } from "react-i18next";

import { menuItems } from "@constants";

import { IconSvg } from "@components/atoms";

export const SettingsMenu = () => {
	const { t } = useTranslation("settings");

	return (
		<div className="bg-black flex flex-1 flex-col h-full pl-6 pt-10 rounded-bl-lg rounded-tl-lg text-lg">
			{menuItems.map((item, index) => (
				<div className="cursor-pointer flex group items-center mb-4" key={index} role="link">
					<div className="bg-gray-500 mr-2 p-2 rounded-full">
						<IconSvg className="fill-white group-hover:fill-green-accent h-3 w-3" src={item.icon} />
					</div>

					<div>{t(item.label)}</div>
				</div>
			))}
		</div>
	);
};
