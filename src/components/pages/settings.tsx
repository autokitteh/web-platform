import React from "react";
import { Bell, Receipt, Sliders, User } from "@assets/image/icons";
import { IconSvg, LogoCatLarge } from "@components/atoms";

export const Settings = () => (
	<div className="flex h-full w-full">
		<div className="flex w-full py-4 h-full">
			<div className="flex bg-black flex-1 rounded-tl-lg rounded-bl-lg flex-col pt-10 pl-6 h-full text-lg">
				<div className="flex mb-4 cursor-pointer group" role="link">
					<div className="p-2 bg-gray-500 rounded-full mr-2">
						<IconSvg className="fill-white h-3 w-3 group-hover:fill-green-accent" src={User} />
					</div>
					My Profile
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
			<div className="flex bg-gray-800 flex-5 rounded-tr-lg rounded-br-lg">
				{" "}
				<LogoCatLarge className="!-bottom-5 !-right-5" />
			</div>
		</div>
	</div>
);
