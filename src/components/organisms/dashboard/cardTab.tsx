import React from "react";

import { IconSvg } from "@components/atoms";

import { IconLogo } from "@assets/image";
import { GithubIcon, MenuCircleIcon } from "@assets/image/icons";

export const DashboardCardTab = () => {
	return (
		<div className="border-gray-50 flex flex-col gap-4 rounded-md border border-black-300 bg-white px-5 pb-7 pt-4">
			<div className="flex items-center gap-1.5">
				<IconSvg size="3xl" src={MenuCircleIcon} />

				<div className="flex gap-1">
					<IconSvg size="2xl" src={GithubIcon} withCircle />

					<IconSvg size="2xl" src={GithubIcon} withCircle />
				</div>
			</div>

			<div className="text-base">
				Automation includes using various equipment and control systems such as factory processes
			</div>

			<div>
				<div className="flex items-center gap-1">
					<IconSvg size="lg" src={IconLogo} />

					<span className="text-black-500">235</span>
				</div>
			</div>
		</div>
	);
};
