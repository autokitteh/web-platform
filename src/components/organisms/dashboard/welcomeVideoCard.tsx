import React from "react";

import { WelcomeVideoCardProps } from "@src/interfaces/components";

import { IconButton } from "@components/atoms";

import { PlayIcon } from "@assets/image/icons";

export const WelcomeVideoCard = ({ description, image, onPlay, title }: WelcomeVideoCardProps) => {
	const backgroundImageStyle = {
		backgroundImage: `url('/assets/image/pages/intro/${image}')`,
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			onPlay?.();
		}
	};

	return (
		<div className="flex gap-4" onClick={onPlay} onKeyDown={handleKeyDown} role="button" tabIndex={0}>
			<IconButton
				className="h-11 w-16 rounded-lg border border-gray-750 bg-cover bg-top bg-no-repeat hover:bg-transparent focus:scale-90"
				style={backgroundImageStyle}
			>
				<PlayIcon className="size-6 fill-white" />
			</IconButton>
			<div className="font-averta">
				<div className="text-lg font-semibold text-white">{title}</div>
				<div className="text-xs text-gray-500">{description}</div>
			</div>
		</div>
	);
};
