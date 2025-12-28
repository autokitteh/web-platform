import { useCallback, useRef, useState } from "react";

import { useTranslation } from "react-i18next";

import { cn } from "@utilities";

import { Button } from "@components/atoms/buttons";

import { RotateRightIcon } from "@assets/image/icons";

const minAnimationDuration = 1200;
const debounceDelay = 500;

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
	const [minTimeElapsed, setMinTimeElapsed] = useState(true);
	const [lastUpdated, setLastUpdated] = useState<string>(() => formatTime(new Date()));
	const lastRefreshClickRef = useRef<number>(0);

	const isSpinning = isRefreshing || !minTimeElapsed;

	const handleRefresh = useCallback(() => {
		const now = Date.now();
		if (now - lastRefreshClickRef.current < debounceDelay || isSpinning || !onRefresh) return;

		lastRefreshClickRef.current = now;
		setMinTimeElapsed(false);
		setLastUpdated(formatTime(new Date()));

		setTimeout(() => {
			setMinTimeElapsed(true);
		}, minAnimationDuration);

		requestAnimationFrame(() => {
			onRefresh();
		});
	}, [isSpinning, onRefresh]);

	return (
		<div className={cn("xs:mt-0 mx-6 mb-6 mt-4 flex items-start justify-between", className)}>
			<h1 className="-ml-4 text-2xl font-bold text-white sm:ml-0">{displayTitle}</h1>

			<div className="xs:mr-0 -mr-6 flex items-center gap-3">
				{lastUpdated ? <span className="text-xs text-gray-500">Updated: {lastUpdated}</span> : null}

				{onRefresh ? (
					<Button
						aria-label="Refresh dashboard"
						className="flex size-7 min-w-0 items-center justify-center p-0"
						disabled={isSpinning}
						onClick={handleRefresh}
						variant="outline"
					>
						<RotateRightIcon
							className={cn("size-3 fill-green-800", {
								"animate-spin": isSpinning,
							})}
						/>
					</Button>
				) : null}
			</div>
		</div>
	);
};
