import { useCallback, useEffect, useRef, useState } from "react";

import { useTranslation } from "react-i18next";

import { cn } from "@utilities";

import { Toggle } from "@components/atoms";
import { Button } from "@components/atoms/buttons";

import { RotateRightIcon } from "@assets/image/icons";

const minAnimationDuration = 1200;
const refreshCycleInterval = 60000;
const debounceDelay = 500;

const formatTime = (date: Date): string => {
	return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

interface DashboardHeaderProps {
	title?: string;
	onRefresh?: () => void;
	isRefreshing?: boolean;
	className?: string;
	autoRefresh?: boolean;
	onAutoRefreshChange?: (enabled: boolean) => void;
}

export const DashboardHeader = ({
	title,
	onRefresh,
	isRefreshing = false,
	className,
	autoRefresh = false,
	onAutoRefreshChange,
}: DashboardHeaderProps) => {
	const { t } = useTranslation("dashboard");
	const displayTitle = title || t("title");
	const [minTimeElapsed, setMinTimeElapsed] = useState(true);
	const [lastUpdated, setLastUpdated] = useState<string>(() => formatTime(new Date()));
	const [elapsedProgress, setElapsedProgress] = useState(0);
	const lastRefreshTimeRef = useRef<number>(Date.now());
	const lastRefreshClickRef = useRef<number>(0);
	const lastToggleClickRef = useRef<number>(0);

	const isSpinning = isRefreshing || !minTimeElapsed;

	const prevIsRefreshingRef = useRef(isRefreshing);

	useEffect(() => {
		if (!autoRefresh) {
			setElapsedProgress(0);
			return;
		}

		if (prevIsRefreshingRef.current && !isRefreshing) {
			lastRefreshTimeRef.current = Date.now();
			setElapsedProgress(0);
		}
		prevIsRefreshingRef.current = isRefreshing;

		if (isRefreshing) return;

		const updateProgress = () => {
			const elapsed = Date.now() - lastRefreshTimeRef.current;
			const progress = Math.min((elapsed / refreshCycleInterval) * 100, 100);
			setElapsedProgress(progress);
		};

		updateProgress();
		const intervalId = setInterval(updateProgress, 1000);

		return () => clearInterval(intervalId);
	}, [autoRefresh, isRefreshing]);

	const handleRefresh = useCallback(() => {
		const now = Date.now();
		if (now - lastRefreshClickRef.current < debounceDelay || isSpinning || !onRefresh) return;

		lastRefreshClickRef.current = now;
		setMinTimeElapsed(false);
		setLastUpdated(formatTime(new Date()));
		lastRefreshTimeRef.current = now;
		setElapsedProgress(0);

		setTimeout(() => {
			setMinTimeElapsed(true);
		}, minAnimationDuration);

		requestAnimationFrame(() => {
			onRefresh();
		});
	}, [isSpinning, onRefresh]);

	const handleAutoRefreshChange = useCallback(
		(enabled: boolean) => {
			const now = Date.now();
			if (now - lastToggleClickRef.current < debounceDelay || !onAutoRefreshChange) return;

			lastToggleClickRef.current = now;
			onAutoRefreshChange(enabled);
			if (enabled) {
				handleRefresh();
			}
		},
		[onAutoRefreshChange, handleRefresh]
	);

	return (
		<div className={cn("xs:mt-0 mx-6 mb-6 mt-4 flex items-start justify-between", className)}>
			<h1 className="-ml-4 text-2xl font-bold text-white sm:ml-0">{displayTitle}</h1>

			<div className="xs:mr-0 -mr-6 flex flex-col items-end gap-2">
				<div className="flex items-center gap-3">
					{lastUpdated ? <span className="text-xs text-gray-500">Updated: {lastUpdated}</span> : null}

					{onRefresh ? (
						<div className="relative">
							{autoRefresh ? (
								<svg
									className="absolute -inset-0.5 size-[calc(100%+4px)] -rotate-90"
									viewBox="0 0 36 36"
								>
									<circle
										className="fill-none stroke-gray-700"
										cx="18"
										cy="18"
										r="16"
										strokeWidth="2"
									/>
									<circle
										className="fill-none stroke-green-800 transition-all duration-1000 ease-linear"
										cx="18"
										cy="18"
										pathLength="100"
										r="16"
										strokeDasharray={`${elapsedProgress} 100`}
										strokeLinecap="round"
										strokeWidth="2"
									/>
								</svg>
							) : null}
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
						</div>
					) : null}
				</div>

				{onAutoRefreshChange ? (
					<Toggle
						checked={autoRefresh}
						className="mt-2"
						label={t("autoRefresh")}
						labelClass="text-xs font-normal text-gray-500"
						labelPosition="left"
						onChange={handleAutoRefreshChange}
						size="sm"
					/>
				) : null}
			</div>
		</div>
	);
};
