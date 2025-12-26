import React from "react";

import { useTranslation } from "react-i18next";

import { cn } from "@src/utilities";

import { IconButton, IconSvg, Tooltip } from "@components/atoms";

import { ActionStoppedIcon, PlayIcon, RotateIcon } from "@assets/image/icons";

export interface AutoRefreshIndicatorProps {
	countdownMs: number;
	intervalMs: number;
	isEnabled: boolean;
	isPaused: boolean;
	isRefreshing: boolean;
	onPause: () => void;
	onRefreshNow: () => void;
	onResume: () => void;
	className?: string;
}

export const AutoRefreshIndicator = ({
	countdownMs,
	intervalMs,
	isEnabled,
	isPaused,
	isRefreshing,
	onPause,
	onRefreshNow,
	onResume,
	className,
}: AutoRefreshIndicatorProps) => {
	const { t } = useTranslation("deployments", { keyPrefix: "sessions.autoRefresh" });

	const progress = intervalMs > 0 ? countdownMs / intervalMs : 0;
	const circumference = 2 * Math.PI * 10;
	const strokeDashoffset = circumference * progress;

	const containerClass = cn("flex items-center gap-2 rounded-full bg-gray-1050 px-2 py-1.5 text-gray-500", className);

	const refreshIconButtonClass =
		"group size-6 rounded-full hover:bg-gray-1250 hover:scale-110 p-1.5 transition-transform";
	const refreshIconClass = cn(
		"fill-gray-500 transition group-hover:fill-green-800",
		isRefreshing && "animate-spin fill-green-800/70"
	);

	const actionIconButtonClass = "group size-7 rounded-full hover:bg-gray-1250 !p-0";
	const actionIconClass = "fill-gray-500 group-hover:fill-green-800 transition";

	if (!isEnabled) {
		return (
			<div className={containerClass}>
				<span className="text-gray-600">{t("disabled")}</span>
				<Tooltip content={t("enable")} position="bottom">
					<IconButton
						ariaLabel={t("enable")}
						className={actionIconButtonClass}
						onClick={onResume}
						title={t("enable")}
					>
						<IconSvg className={actionIconClass} size="2md" src={PlayIcon} />
					</IconButton>
				</Tooltip>
			</div>
		);
	}

	return (
		<div className={containerClass}>
			<div className="flex items-center gap-1">
				{isPaused ? (
					<Tooltip content={t("resume")} position="bottom">
						<IconButton
							ariaLabel={t("resume")}
							className={actionIconButtonClass}
							onClick={onResume}
							title={t("resume")}
						>
							<IconSvg className={actionIconClass} size="2md" src={PlayIcon} />
						</IconButton>
					</Tooltip>
				) : (
					<Tooltip content={t("pause")} position="bottom">
						<IconButton
							ariaLabel={t("pause")}
							className={actionIconButtonClass}
							onClick={onPause}
							title={t("pause")}
						>
							<IconSvg className={actionIconClass} size="2md" src={ActionStoppedIcon} />
						</IconButton>
					</Tooltip>
				)}
				<div className="relative">
					<svg className="pointer-events-none absolute -inset-0.5 size-7 -rotate-90" viewBox="0 0 24 24">
						<circle className="stroke-gray-750" cx="12" cy="12" fill="none" r="10" strokeWidth="2" />
						<circle
							className="stroke-green-800 transition-all duration-1000 ease-linear"
							cx="12"
							cy="12"
							fill="none"
							r="10"
							strokeDasharray={circumference}
							strokeDashoffset={strokeDashoffset}
							strokeLinecap="round"
							strokeWidth="2"
						/>
					</svg>
					<IconButton
						ariaLabel={t("refreshNow")}
						className={refreshIconButtonClass}
						disabled={isRefreshing}
						onClick={onRefreshNow}
						title={t("refreshNow")}
					>
						<IconSvg className={refreshIconClass} size="sm" src={RotateIcon} />
					</IconButton>
				</div>
			</div>
		</div>
	);
};
