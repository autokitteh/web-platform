import React from "react";

import { WelcomeInfoCardProps } from "@src/interfaces/components";

import { IconButton } from "@components/atoms";

import { CirclePlayIcon } from "@assets/image/icons";

export const WelcomeInfoCard = ({ children, onPlay, title, videoStyle }: WelcomeInfoCardProps) => (
	<div className="flex flex-col rounded-2xl border border-gray-950 bg-gray-1250 py-5 pl-6 pr-4 font-averta text-white">
		{title}

		<div className="mt-auto flex items-center pt-2.5">
			<div
				className="flex min-h-32 w-2/5 items-center justify-center rounded-2xl border border-gray-750 bg-contain bg-center bg-no-repeat"
				style={videoStyle}
			>
				<IconButton className="group size-11 overflow-hidden rounded-full p-0 focus:scale-90" onClick={onPlay}>
					<CirclePlayIcon className="rounded-full fill-white transition group-hover:opacity-70" />
				</IconButton>
			</div>

			<div className="w-1/2">{children}</div>
		</div>
	</div>
);
