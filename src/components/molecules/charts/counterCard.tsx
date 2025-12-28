import { cn } from "@utilities";

export interface CounterCardProps {
	label: string;
	value: number;
	accentColor?: string;
	isLoading?: boolean;
	className?: string;
}

export const CounterCard = ({ label, value, accentColor, isLoading, className }: CounterCardProps) => {
	const baseStyles = "rounded-lg border border-gray-1050 bg-gray-1200 p-3 h-[5rem] sm:h-[6.5rem] sm:p-4";

	const loaderClass = cn(baseStyles, "animate-pulse", className);

	const cardClass = cn(baseStyles, "group relative overflow-hidden transition-all hover:border-gray-950", className);

	if (isLoading) {
		return (
			<div className={loaderClass}>
				<div>
					<div className="h-3 w-14 rounded bg-gray-1050 sm:w-3/4" />
					<div className="mt-1 h-6 w-10 rounded bg-gray-1050 sm:mt-2 sm:h-8 sm:w-1/2" />
				</div>
			</div>
		);
	}

	return (
		<div className={cardClass}>
			{accentColor ? (
				<div className="absolute left-0 top-0 h-full w-0.5" style={{ backgroundColor: accentColor }} />
			) : null}
			<div className="flex h-full flex-col">
				<p className="font-fira-sans text-10 uppercase leading-tight tracking-wider text-gray-600 sm:truncate sm:text-xs">
					{label}
				</p>
				<div className="flex-1" />
				<p className="font-fira-code text-lg font-medium tabular-nums tracking-wider text-white sm:text-2xl">
					{value.toLocaleString()}
				</p>
			</div>
		</div>
	);
};
