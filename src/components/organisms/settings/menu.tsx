import React from "react";
import { IconSvg } from "@components/atoms";
import { menuItems } from "@constants";
import { useTranslation } from "react-i18next";

export const SettingsMenu = () => {
	const { t } = useTranslation("settings");

	return (
		<div className="flex bg-black flex-1 rounded-tl-lg rounded-bl-lg flex-col pt-10 pl-6 h-full text-lg">
			{menuItems.map((item, index) => (
				<div className="flex mb-4 cursor-pointer group items-center" key={index} role="link">
					<div className="p-2 bg-gray-500 rounded-full mr-2">
						<IconSvg className="fill-white h-3 w-3 group-hover:fill-green-accent" src={item.icon} />
					</div>
					<div>{t(item.label)}</div>
				</div>
			))}
		</div>
	);
};
