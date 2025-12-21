import { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { cn } from "@utilities";

import { Button } from "@components/atoms/buttons";

import { RotateRightIcon } from "@assets/image/icons";

const minAnimationDuration = 1200;

const formatTime = (date: Date): string => {
	return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

interface DashboardHeaderProps {
	title?: string;
	onRefresh?: () => void;
	isRefreshing?: boolean;
	className?: string;
}

export const DashboardHeader = ({ title, onRefresh, isRefreshing = false, className }: DashboardHeaderProps) => {
	const { t } = useTranslation("dashboard");
	const displayTitle = title || t("title");
	const [isAnimating, setIsAnimating] = useState(false);
	const [minTimeElapsed, setMinTimeElapsed] = useState(true);
	const [lastUpdated, setLastUpdated] = useState<string>(() => formatTime(new Date()));

	useEffect(() => {
		if (!isRefreshing && minTimeElapsed) {
			setIsAnimating(false);
		}
	}, [isRefreshing, minTimeElapsed]);

	const handleRefresh = () => {
		if (isAnimating || !onRefresh) return;

		setIsAnimating(true);
		setMinTimeElapsed(false);
		setLastUpdated(formatTime(new Date()));

		setTimeout(() => {
			setMinTimeElapsed(true);
		}, minAnimationDuration);

		requestAnimationFrame(() => {
			onRefresh();
		});
	};

	return (
		<div className={cn("mx-6 mb-6 flex items-center justify-between", className)}>
			<h1 className="text-2xl font-bold text-white">{displayTitle}</h1>

			<div className="flex items-center gap-3">
				{lastUpdated ? <span className="text-xs text-gray-500">Updated: {lastUpdated}</span> : null}

				{onRefresh ? (
					<Button
						aria-label="Refresh dashboard"
						disabled={isAnimating}
						onClick={handleRefresh}
						variant="outline"
					>
						<RotateRightIcon
							className={cn("group size-4 rounded-full fill-green-800", {
								"animate-spin": isAnimating,
							})}
						/>
					</Button>
				) : null}
			</div>
		</div>
	);
};
