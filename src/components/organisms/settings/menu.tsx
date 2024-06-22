import React from "react";
import { Bell, Receipt, Security, Sliders, User } from "@assets/image/icons";
import { IconSvg } from "@components/atoms";
import { useTranslation } from "react-i18next";

export const SettingsMenu = () => {
	const { t } = useTranslation("settings");

	return (
		<div className="flex bg-black flex-1 rounded-tl-lg rounded-bl-lg flex-col pt-10 pl-6 h-full text-lg">
			<div className="flex mb-4 cursor-pointer group" role="link">
				<div className="p-2 bg-gray-500 rounded-full mr-2">
					<IconSvg className="fill-white h-3 w-3 group-hover:fill-green-accent" src={User} />
				</div>
				{t("menu.myProfile")}
			</div>
			<div className="flex mb-4 cursor-pointer group" role="link">
				<div className="p-2 bg-gray-500 rounded-full mr-2">
					<IconSvg className="fill-white h-3 w-3 group-hover:fill-green-accent" src={Security} />
				</div>
				{t("menu.security")}
			</div>
			<div className="flex mb-4 cursor-pointer group" role="link">
				<div className="p-2 bg-gray-500 rounded-full mr-2">
					<IconSvg className="fill-white h-3 w-3 group-hover:fill-green-accent" src={Bell} />
				</div>
				{t("menu.notifications")}
			</div>
			<div className="flex mb-4 cursor-pointer group" role="link">
				<div className="p-2 bg-gray-500 rounded-full mr-2">
					<IconSvg className="fill-white h-3 w-3 group-hover:fill-green-accent" src={Sliders} />
				</div>
				{t("menu.advanced")}
			</div>
			<div className="flex mb-4 cursor-pointer group" role="link">
				<div className="p-2 bg-gray-500 rounded-full mr-2">
					<IconSvg className="fill-white h-3 w-3 group-hover:fill-green-accent" src={Receipt} />
				</div>
				{t("menu.billing")}
			</div>
		</div>
	);
};
