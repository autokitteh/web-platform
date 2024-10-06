import React from "react";

import { useTranslation } from "react-i18next";

import { menuItems } from "@constants";

import { Button, IconSvg } from "@components/atoms";

export const SettingsMenu = () => {
	const { t } = useTranslation("settings");

	return (
		<div className="flex h-full flex-1 flex-col rounded-l-lg bg-black pl-6 pt-10 text-lg">
			{menuItems.map((item, index) => (
				<Button
					className="group mb-4 mr-2 flex cursor-pointer items-center text-white"
					href={item.path}
					key={index}
				>
					<div className="mr-2 rounded-full bg-gray-950 p-2">
						<IconSvg className="fill-white group-hover:fill-green-800" size="sm" src={item.icon} />
					</div>

					<div>{t(item.label)}</div>
				</Button>
			))}
		</div>
	);
};
