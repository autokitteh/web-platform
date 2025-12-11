import { MetricLabelProps } from "@interfaces/components/dashboardStats.interface";
import { cn } from "@utilities";

const colorClasses: Record<string, string> = {
	green: "text-green-700",
	blue: "text-blue-500",
	red: "text-red-500",
	amber: "text-amber-500",
	gray: "text-gray-700",
	slate: "text-gray-500",
};

export const MetricLabel = ({ label, value, valueColor, className }: MetricLabelProps) => {
	const valueColorClass = valueColor ? colorClasses[valueColor] : "text-gray-1100";

	return (
		<div className={cn("flex items-baseline gap-2", className)}>
			<span className="text-sm text-gray-700">{label}:</span>
			<span className={cn("text-sm font-semibold", valueColorClass)}>{value}</span>
		</div>
	);
};
