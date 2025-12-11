import { MetricGroupProps } from "@interfaces/components/dashboardStats.interface";
import { cn } from "@utilities";

const columnClasses = {
	2: "grid-cols-1 sm:grid-cols-2",
	3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
	4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

export const MetricGroup = ({ children, columns = 4, className }: MetricGroupProps) => (
	<div className={cn("grid gap-4", columnClasses[columns], className)}>{children}</div>
);
