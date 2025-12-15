import React from "react";

import { sessionStatusHex, sessionStatusLabels, SessionStatus } from "@constants";
import { cn } from "@utilities";

interface ActivityItem {
	id: string;
	projectName: string;
	status: SessionStatus;
	timestamp: string;
	duration: string;
}

interface ActivityPulseProps {
	activities: ActivityItem[];
	isLoading?: boolean;
	className?: string;
}

const PulseDot = ({ status }: { status: SessionStatus }) => {
	const color = sessionStatusHex[status];
	const isActive = status === "running";

	return (
		<span className="relative flex size-3">
			{isActive ? (
				<span
					className="absolute inline-flex size-full animate-ping rounded-full opacity-75"
					style={{ backgroundColor: color }}
				/>
			) : null}
			<span className="relative inline-flex size-3 rounded-full" style={{ backgroundColor: color }} />
		</span>
	);
};

const ActivitySkeleton = () => (
	<div className="space-y-4">
		{Array.from({ length: 6 }).map((_, i) => (
			<div className="flex items-center gap-4" key={i}>
				<div className="size-3 animate-pulse rounded-full bg-gray-1050" />
				<div className="flex-1 space-y-2">
					<div className="h-4 w-3/4 animate-pulse rounded bg-gray-1050" />
					<div className="h-3 w-1/2 animate-pulse rounded bg-gray-1050" />
				</div>
			</div>
		))}
	</div>
);

export const ActivityPulse = ({ activities, isLoading = false, className }: ActivityPulseProps) => {
	if (isLoading) {
		return (
			<div className={cn("rounded-2xl bg-gray-1200 p-6", className)}>
				<div className="mb-6 h-6 w-32 animate-pulse rounded bg-gray-1050" />
				<ActivitySkeleton />
			</div>
		);
	}

	return (
		<div className={cn("rounded-2xl bg-gray-1200 p-6", className)}>
			<div className="mb-6 flex items-center justify-between">
				<h3 className="text-lg font-semibold text-white">Live Activity</h3>
				<span className="flex items-center gap-2 text-xs text-gray-500">
					<span className="relative flex size-2">
						<span className="absolute inline-flex size-full animate-ping rounded-full bg-green-500 opacity-75" />
						<span className="relative inline-flex size-2 rounded-full bg-green-500" />
					</span>
					Real-time
				</span>
			</div>

			<div className="relative">
				<div className="absolute inset-y-0 left-1.5 w-px bg-gradient-to-b from-gray-1050 via-gray-1050 to-transparent" />

				<div className="space-y-5">
					{activities.map((activity, index) => (
						<div
							className={cn(
								"relative flex items-start gap-4 pl-6 transition-all duration-300",
								index === 0 && "opacity-100",
								index > 0 && "opacity-80 hover:opacity-100"
							)}
							key={activity.id}
						>
							<div className="absolute left-0 top-1">
								<PulseDot status={activity.status} />
							</div>

							<div className="min-w-0 flex-1">
								<div className="flex items-center gap-2">
									<span className="truncate font-medium text-white">{activity.projectName}</span>
									<span
										className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
										style={{
											backgroundColor: `${sessionStatusHex[activity.status]}20`,
											color: sessionStatusHex[activity.status],
										}}
									>
										{sessionStatusLabels[activity.status]}
									</span>
								</div>
								<div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
									<span>{activity.timestamp}</span>
									<span className="size-1 rounded-full bg-gray-700" />
									<span>{activity.duration}</span>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};
