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
		"h-[6.5rem] animate-pulse rounded-lg border border-gray-1050 bg-gray-1200 px-2 py-1.5 sm:p-4",
		className
	);
	const cardClass = cn(
		"group relative overflow-hidden rounded-lg border border-gray-1050 bg-gray-1200 px-2 py-1.5 transition-all hover:border-gray-950 sm:p-4",
		className
	);
	if (isLoading) {
		return (
			<div className={loaderClass}>
				<div className="h-2 w-14 rounded bg-gray-1050 sm:h-3 sm:w-20" />
				<div className="mt-0.5 h-5 w-10 rounded bg-gray-1050 sm:mt-1 sm:h-8 sm:w-16" />
				<div className="mt-0.5 hidden h-3 w-12 rounded bg-gray-1050 sm:block" />
			</div>
		);
	}

	return (
		<div className={cardClass}>
			{accentColor ? (
				<div className="absolute left-0 top-0 h-full w-0.5" style={{ backgroundColor: accentColor }} />
			) : null}
			<p className="truncate font-fira-sans text-[9px] uppercase tracking-wider text-gray-600 sm:text-xs">
				{label}
			</p>
			<p className="font-fira-code text-base font-medium tabular-nums text-white sm:mt-1 sm:text-2xl">
				{value.toLocaleString()}
			</p>
			{subValue ? (
				<p className="mt-0.5 hidden font-fira-code text-xs text-gray-500 sm:block">{subValue}</p>
			) : null}
		</div>
	);
};
