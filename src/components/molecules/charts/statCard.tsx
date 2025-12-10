import { cn } from "@utilities";

interface StatCardProps {
	title: string;
	value: string | number;
	delta?: number;
	deltaLabel?: string;
	isLoading?: boolean;
	className?: string;
}

export const StatCard = ({ title, value, delta, deltaLabel, isLoading = false, className }: StatCardProps) => {
	const getDeltaColor = () => {
		if (delta === undefined || delta === 0) return "text-gray-500";

		return delta > 0 ? "text-green-500" : "text-red-500";
	};

	const getDeltaPrefix = () => {
		if (delta === undefined || delta === 0) return "";

		return delta > 0 ? "+" : "";
	};

	if (isLoading) {
		return (
			<div className={cn("animate-pulse rounded-xl border border-gray-1050 bg-gray-1200 p-6", className)}>
				<div className="mb-2 h-4 w-24 rounded bg-gray-1050" />
				<div className="mb-2 h-8 w-16 rounded bg-gray-1050" />
				<div className="h-3 w-20 rounded bg-gray-1050" />
			</div>
		);
	}

	return (
		<div className={cn("rounded-xl border border-gray-1050 bg-gray-1200 p-6", className)}>
			<p className="text-sm text-gray-500">{title}</p>
			<p className="mt-1 text-3xl font-semibold text-white">{value}</p>
			{delta !== undefined ? (
				<p className={cn("mt-1 text-sm", getDeltaColor())}>
					{getDeltaPrefix()}
					{delta}
					{deltaLabel ? ` ${deltaLabel}` : ""}
				</p>
			) : null}
		</div>
	);
};
