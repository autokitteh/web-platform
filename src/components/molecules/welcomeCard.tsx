import React from "react";

import { useTranslation } from "react-i18next";

import { WelcomeCardProps } from "@interfaces/components";
import { cn } from "@src/utilities";

import { Button, IconSvg, Loader } from "@components/atoms";

export const WelcomeCard = ({
	title,
	icon,
	isLoading = false,
	onClick,
	onMouseEnter,
	onMouseLeave,
}: WelcomeCardProps) => {
	const { t } = useTranslation("dashboard", { keyPrefix: "welcomeLanding" });

	const buttonClass = cn(
		"group h-fit w-full flex-row items-center justify-center rounded-2xl border-2 border-green-800/50 bg-gray-800/20 p-3 text-xl font-bold text-white transition-colors hover:border-green-800/70 hover:bg-gray-1100",
		isLoading && "bg-green-800 text-gray-1100"
	);

	return (
		<Button
			className={buttonClass}
			disabled={isLoading}
			onClick={onClick}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
		>
			<IconSvg className="mr-2 fill-white" size="2xl" src={icon} />
			{title}
			{isLoading ? (
				<div className="flex items-center justify-center gap-4">
					<Loader size="md" /> {t("creating")}
				</div>
			) : null}
		</Button>
	);
};
