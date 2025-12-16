import { useEffect, useState } from "react";

import { cn } from "@utilities";

import { Button } from "@components/atoms/buttons";

import { RotateRightIcon } from "@assets/image/icons";

const minAnimationDuration = 1200;

interface DashboardHeaderProps {
	title: string;
	onRefresh?: () => void;
	isRefreshing?: boolean;
	lastUpdated?: string;
	className?: string;
}

export const DashboardHeader = ({
	title = "Projects",
	onRefresh,
	isRefreshing = false,
	lastUpdated,
	className,
}: DashboardHeaderProps) => {
	const [isAnimating, setIsAnimating] = useState(false);
	const [minTimeElapsed, setMinTimeElapsed] = useState(true);

	useEffect(() => {
		if (!isRefreshing && minTimeElapsed) {
			setIsAnimating(false);
		}
	}, [isRefreshing, minTimeElapsed]);

	const handleRefresh = () => {
		if (isAnimating || !onRefresh) return;

		setIsAnimating(true);
		setMinTimeElapsed(false);
		onRefresh();

		setTimeout(() => {
			setMinTimeElapsed(true);
		}, minAnimationDuration);
	};

	return (
		<div className={cn("mx-6 mb-6 flex items-center justify-between", className)}>
			<h1 className="text-2xl font-bold text-white">{title}</h1>

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
