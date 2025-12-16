import { sessionStatusHex, sessionStatusLabels, SessionStatus } from "@constants";
import { ActivityState } from "@constants/activities.constants";
import { cn } from "@utilities";

interface SessionCountersMiniProps {
	completed: number;
	running: number;
	error: number;
	stopped: number;
	created?: number;
	showLabels?: boolean;
	size?: "sm" | "md" | "lg";
	className?: string;
}

const sizeClasses = {
	sm: "text-xs",
	md: "text-sm",
	lg: "text-base",
};

const dotSizeClasses = {
	sm: "size-1.5",
	md: "size-2",
	lg: "size-2.5",
};

export const SessionCountersMini = ({
	completed,
	running,
	error,
	stopped,
	created = 0,
	showLabels = false,
	size = "sm",
	className,
}: SessionCountersMiniProps) => {
	const counters: Array<{ count: number; status: SessionStatus }> = [
		{ status: ActivityState.completed, count: completed },
		{ status: ActivityState.running, count: running },
		{ status: ActivityState.error, count: error },
		{ status: ActivityState.stopped, count: stopped },
		...(created > 0 ? [{ status: ActivityState.created as SessionStatus, count: created }] : []),
	];

	return (
		<div className={cn("flex items-center gap-3", sizeClasses[size], className)}>
			{counters.map(({ status, count }) => (
				<div className="flex items-center gap-1.5" key={status}>
					<span
						className={cn("rounded-full", dotSizeClasses[size])}
						style={{ backgroundColor: sessionStatusHex[status] }}
					/>
					<span className="font-fira-code tabular-nums text-gray-400">{count}</span>
					{showLabels ? <span className="text-gray-600">{sessionStatusLabels[status]}</span> : null}
				</div>
			))}
		</div>
	);
};
