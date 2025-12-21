import { cn } from "@utilities";

interface TableSkeletonProps {
	rows?: number;
	className?: string;
	variant?: "default" | "compact";
}

export const TableSkeleton = ({ rows = 3, className, variant = "default" }: TableSkeletonProps) => {
	const isCompact = variant === "compact";

	return (
		<div className={cn("animate-pulse space-y-2", className)}>
			{Array.from({ length: rows }, (_, i) => (
				<div
					className={cn("flex items-center gap-4 rounded-lg bg-gray-1200", isCompact ? "p-2" : "p-3")}
					key={i}
				>
					<div className={cn("rounded bg-gray-1050", isCompact ? "h-3 w-24" : "h-4 w-32")} />
					<div className={cn("rounded bg-gray-1050", isCompact ? "h-3 w-16" : "h-4 w-24")} />
					<div className="flex-1" />
					<div className={cn("rounded bg-gray-1050", isCompact ? "h-3 w-20" : "h-4 w-28")} />
				</div>
			))}
		</div>
	);
};
