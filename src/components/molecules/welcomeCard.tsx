import React from "react";

import { useTranslation } from "react-i18next";

import { WelcomeCardProps } from "@interfaces/components";
import { cn } from "@src/utilities";

import { Button, IconSvg, Loader } from "@components/atoms";

export const WelcomeCard = ({
	id,
	title,
	description,
	icon,
	isLoading = false,
	onClick,
	onMouseEnter,
	onMouseLeave,
}: WelcomeCardProps) => {
	const { t } = useTranslation("dashboard", { keyPrefix: "welcomeLanding" });

	const buttonClass = cn(
		"group relative h-64 w-full flex-row items-center",
		"justify-center rounded-2xl border-2 border-green-800/50",
		"bg-gray-800/20 p-3 px-6  text-xl text-white transition-all",
		"duration-500 ease-out hover:scale-[1.02] hover:border-green-800",
		"hover:bg-gray-1100 hover:shadow-[0_0_30px_rgba(126,211,33,0.3)]",
		isLoading && "bg-green-800 text-gray-1100"
	);

	const iconClass = cn("relative z-10 mb-4 size-12 fill-white", {
		"stroke-white fill-none": id === "importExisting",
	});

	return (
		<Button
			ariaLabel={isLoading ? t("creating") : title}
			className={buttonClass}
			disabled={isLoading}
			onClick={onClick}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			style={{
				background: `
							radial-gradient(circle at 20% 80%, rgba(126, 211, 33, 0.1) 0%, transparent 50%),
							radial-gradient(circle at 80% 20%, rgba(126, 211, 33, 0.05) 0%, transparent 50%)
						`,
			}}
		>
			<div className="grid size-full grid-rows-[1fr_auto_auto] place-items-center gap-2">
				<div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100">
					<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-800/20 via-transparent to-green-800/10" />
					<div className="absolute inset-0 animate-pulse rounded-2xl bg-[radial-gradient(circle_at_50%_50%,rgba(126,211,33,0.15),transparent_70%)]" />
				</div>
				<div className="flex flex-col items-center gap-2 pt-8">
					<IconSvg className={iconClass} src={icon} />
					<div className="relative z-10 font-semibold">{title}</div>
				</div>
				<div className="relative z-10 min-h-12 text-center text-base text-white">{description}</div>
				{isLoading ? (
					<div className="relative z-10 flex h-12 items-center justify-center gap-4 pb-2">
						<Loader size="md" /> {t("creating")}
					</div>
				) : null}
			</div>
		</Button>
	);
};
