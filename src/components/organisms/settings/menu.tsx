import React from "react";
import { Bell, Receipt, Security, Sliders, User } from "@assets/image/icons";
import { IconSvg } from "@components/atoms";

export const SettingsMenu = () => (
	<div className="flex bg-black flex-1 rounded-tl-lg rounded-bl-lg flex-col pt-10 pl-6 h-full text-lg">
		<div className="flex mb-4 cursor-pointer group" role="link">
			<div className="p-2 bg-gray-500 rounded-full mr-2">
				<IconSvg className="fill-white h-3 w-3 group-hover:fill-green-accent" src={User} />
			</div>
			My Profile
		</div>
		<div className="flex mb-4 cursor-pointer group" role="link">
			<div className="p-2 bg-gray-500 rounded-full mr-2">
				<IconSvg className="fill-white h-3 w-3 group-hover:fill-green-accent" src={Security} />
			</div>
			Security
		</div>
		<div className="flex mb-4 cursor-pointer group" role="link">
			<div className="p-2 bg-gray-500 rounded-full mr-2">
				<IconSvg className="fill-white h-3 w-3 group-hover:fill-green-accent" src={Bell} />
			</div>
			Notifications
		</div>
		<div className="flex mb-4 cursor-pointer group" role="link">
			<div className="p-2 bg-gray-500 rounded-full mr-2">
				<IconSvg className="fill-white h-3 w-3 group-hover:fill-green-accent" src={Sliders} />
			</div>
			Advanced
		</div>
		<div className="flex mb-4 cursor-pointer group" role="link">
			<div className="p-2 bg-gray-500 rounded-full mr-2">
				<IconSvg className="fill-white h-3 w-3 group-hover:fill-green-accent" src={Receipt} />
			</div>
			Billing
		</div>
	</div>
);
