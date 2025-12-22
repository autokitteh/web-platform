import { cn } from "@utilities";

export interface CounterCardProps {
	label: string;
	value: number;
	subValue?: string;
	accentColor?: string;
	isLoading?: boolean;
	className?: string;
}

export const CounterCard = ({ label, value, subValue, accentColor, isLoading, className }: CounterCardProps) => {
	const loaderClass = cn(
		"animate-pulse rounded-lg border border-gray-1050 bg-gray-1200 p-3 sm:h-[6.5rem] sm:p-4",
		className
	);

	const cardClass = cn(
		"group relative overflow-hidden rounded-lg border border-gray-1050 bg-gray-1200 p-3 transition-all hover:border-gray-950 sm:p-4",
		className
	);

	if (isLoading) {
		return (
			<div className={loaderClass}>
				<div className="flex items-center justify-between gap-2 sm:block">
					<div className="h-4 w-14 rounded bg-gray-1050 sm:h-3 sm:w-20" />
					<div className="h-7 w-10 rounded bg-gray-1050 sm:mt-1 sm:h-8 sm:w-16" />
				</div>
				<div className="mt-0.5 hidden h-3 w-12 rounded bg-gray-1050 sm:block" />
			</div>
		);
	}

	return (
		<div className={cardClass}>
			{accentColor ? (
				<div className="absolute left-0 top-0 h-full w-0.5" style={{ backgroundColor: accentColor }} />
			) : null}
			<div className="flex items-center justify-between gap-2 sm:block">
				<p className="break-words font-fira-sans text-xs uppercase tracking-wider text-gray-600 sm:truncate">
					{label}
				</p>
				<p className="font-fira-sans text-xl font-thin tabular-nums tracking-wider text-white sm:mt-1 sm:font-fira-code sm:text-2xl sm:font-medium">
					{value.toLocaleString()}
				</p>
			</div>
			{subValue ? (
				<p className="mt-0.5 hidden font-fira-code text-xs text-gray-500 sm:block">{subValue}</p>
			) : null}
		</div>
	);
};
