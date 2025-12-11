import { sessionStatusHex, sessionStatusLabels } from "@constants";
import { SessionStatusBadgeProps } from "@interfaces/components/dashboardStats.interface";
import { cn } from "@utilities";

export const SessionStatusBadge = ({
	status,
	label,
	showDot = true,
	size = "md",
	className,
}: SessionStatusBadgeProps) => {
	const displayLabel = label || sessionStatusLabels[status];
	const dotColor = sessionStatusHex[status];

	const sizeClasses = {
		sm: "text-xs px-1.5 py-0.5",
		md: "text-sm px-2 py-1",
		lg: "text-base px-2.5 py-1.5",
	};

	const dotSizeClasses = {
		sm: "size-1.5",
		md: "size-2",
		lg: "size-2.5",
	};

	const baseClasses = cn(
		"inline-flex items-center gap-1.5 rounded-full font-medium",
		"bg-gray-100 text-gray-800",
		sizeClasses[size],
		className
	);

	return (
		<span aria-label={`Status: ${displayLabel}`} className={baseClasses} role="status">
			{showDot ? (
				<span
					className={cn("shrink-0 rounded-full", dotSizeClasses[size])}
					style={{ backgroundColor: dotColor }}
				/>
			) : null}
			{displayLabel}
		</span>
	);
};
