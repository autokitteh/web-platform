import React from "react";

import { useTranslation } from "react-i18next";

import { WelcomeCardProps } from "@interfaces/components";
import { cn } from "@utilities";

import { Button, IconSvg, Loader, Typography } from "@components/atoms";

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
	type = "demo",
}: WelcomeCardProps) => {
	const { t } = useTranslation("dashboard", { keyPrefix: "welcomeLanding" });

	const buttonClass = cn(
		"mt-auto flex w-full justify-center rounded-lg py-3 text-lg font-semibold",
		isLoading && "bg-green-800 text-gray-1100",
		!isLoading && type === "demo" && "bg-green-800 text-gray-1100",
		!isLoading &&
			type === "template" &&
			"bg-gray-900 text-white group-hover:bg-green-800 group-hover:text-gray-1100",
		!isLoading && type === "demo" && isHovered && "bg-gray-900 text-white"
	);

	return (
		<Button
			className="group flex h-fit flex-col items-center rounded-2xl border-2 border-green-800/50 bg-gray-800/20 p-8 pb-6 transition-colors hover:border-green-800/70 hover:bg-gray-1100"
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
			<div className={buttonClass}>
				{isLoading ? (
					<div className="flex items-center justify-center gap-4">
						<Loader size="md" /> {t("creating")}
					</div>
				) : (
					buttonText
				)}
			</div>
		</Button>
	);
};
