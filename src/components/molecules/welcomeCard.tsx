import React from "react";

import { cn } from "@src/utilities";

import { Button, IconSvg, Loader, Typography } from "@components/atoms";

interface WelcomeCardProps {
	title: string;
	description: string;
	buttonText: string;
	icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
	isLoading?: boolean;
	isHovered?: boolean;
	onClick: () => void;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
}

export const WelcomeCard = ({
	title,
	description,
	buttonText,
	icon,
	isLoading = false,
	isHovered = false,
	onClick,
	onMouseEnter,
	onMouseLeave,
}: WelcomeCardProps) => {
	return (
		<Button
			className="group flex h-full flex-col items-center rounded-2xl border-2 border-green-800/50 bg-gray-800/20 p-8 pb-6 transition-colors hover:border-green-800/50"
			disabled={isLoading}
			onClick={onClick}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
		>
			<div className="mb-6 rounded-full bg-gray-900 fill-white p-6 group-hover:fill-green-800/60">
				<IconSvg className="size-12" src={icon} />
			</div>
			<Typography className="mb-4 text-2xl font-bold text-white" element="h3">
				{title}
			</Typography>
			<Typography className="mb-8 min-h-[4.5rem] text-center text-gray-300" element="p">
				{description}
			</Typography>
			<div
				className={cn(
					"mt-auto w-full justify-center rounded-lg py-3 text-lg font-semibold",
					isLoading || !isHovered ? "bg-green-800 text-gray-1100" : "bg-gray-900 text-white",
					isHovered && "group-hover:bg-green-800/80 group-hover:text-gray-1100"
				)}
			>
				{isLoading ? (
					<div className="flex items-center justify-center">
						<Loader className="mr-2" size="sm" /> Creating...
					</div>
				) : (
					buttonText
				)}
			</div>
		</Button>
	);
};
