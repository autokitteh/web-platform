import React from "react";

import { WelcomeInfoCardProps } from "@src/interfaces/components";

import { IconButton } from "@components/atoms";

import { CirclePlayIcon } from "@assets/image/icons";

export const WelcomeInfoCard = ({ children, onPlay, title }: WelcomeInfoCardProps) => (
	<div className="rounded-2xl border border-gray-950 bg-gray-1250 py-5 pl-6 pr-4 font-averta text-white">
		{title}

		<div className="mt-2.5 flex items-center">
			<div className="flex min-h-32 w-1/2 items-center justify-center rounded-2xl border border-gray-750 bg-gray-1400">
				<IconButton
					className="group h-11 w-11 overflow-hidden rounded-full p-0 focus:scale-90"
					onClick={onPlay}
				>
					<CirclePlayIcon className="rounded-full transition group-hover:fill-white" />
				</IconButton>
			</div>

			<div className="w-1/2">{children}</div>
		</div>
	</div>
);
