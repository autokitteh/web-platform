import React, { useMemo } from "react";

import { useTranslation } from "react-i18next";

import { cn } from "@src/utilities";

import { IconButton, IconSvg, Loader, Tooltip } from "@components/atoms";

import { ActionStoppedIcon, PlayIcon, RotateIcon } from "@assets/image/icons";

export interface AutoRefreshIndicatorProps {
	countdownMs: number;
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
	isEnabled,
	isPaused,
	isRefreshing,
	onPause,
	onRefreshNow,
	onResume,
	className,
}: AutoRefreshIndicatorProps) => {
	const { t } = useTranslation("deployments", { keyPrefix: "sessions.autoRefresh" });

	const formattedCountdown = useMemo(() => {
		const seconds = Math.ceil(countdownMs / 1000);
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
	}, [countdownMs]);

	const containerClass = cn(
		"flex items-center gap-2 rounded-full bg-gray-1050 px-2 py-1 text-xs text-gray-500",
		className
	);

	const iconButtonClass = "group size-6 rounded-full hover:bg-gray-1250 p-0.5";
	const iconClass = "fill-gray-500 group-hover:fill-green-800 transition";

	if (!isEnabled) {
		return (
			<div className={containerClass}>
				<span className="text-gray-600">{t("disabled")}</span>
				<Tooltip content={t("enable")} position="bottom">
					<IconButton
						ariaLabel={t("enable")}
						className={iconButtonClass}
						onClick={onResume}
						title={t("enable")}
					>
						<IconSvg className={iconClass} size="sm" src={PlayIcon} />
					</IconButton>
				</Tooltip>
			</div>
		);
	}

	return (
		<div className={containerClass}>
			{isRefreshing ? (
				<>
					<Loader size="xs" />
					<span>{t("refreshing")}</span>
				</>
			) : (
				<>
					<span className="min-w-12 font-mono">{formattedCountdown}</span>
					<div className="flex items-center gap-0.5">
						{isPaused ? (
							<Tooltip content={t("resume")} position="bottom">
								<IconButton
									ariaLabel={t("resume")}
									className={iconButtonClass}
									onClick={onResume}
									title={t("resume")}
								>
									<IconSvg className={iconClass} size="sm" src={PlayIcon} />
								</IconButton>
							</Tooltip>
						) : (
							<Tooltip content={t("pause")} position="bottom">
								<IconButton
									ariaLabel={t("pause")}
									className={iconButtonClass}
									onClick={onPause}
									title={t("pause")}
								>
									<IconSvg className={iconClass} size="sm" src={ActionStoppedIcon} />
								</IconButton>
							</Tooltip>
						)}
						<Tooltip content={t("refreshNow")} position="bottom">
							<IconButton
								ariaLabel={t("refreshNow")}
								className={iconButtonClass}
								disabled={isRefreshing}
								onClick={onRefreshNow}
								title={t("refreshNow")}
							>
								<IconSvg className={cn(iconClass, "size-3.5")} size="sm" src={RotateIcon} />
							</IconButton>
						</Tooltip>
					</div>
				</>
			)}
		</div>
	);
};
