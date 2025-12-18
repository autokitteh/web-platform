import { SparkAreaChart } from "@tremor/react";

import { triggerTypeLabels, TriggerType } from "@constants";
import { cn, formatDuration } from "@utilities";

import { TBody, THead, Table, Td, Th, Tr } from "@components/atoms";

interface ErrorSessionData {
	projectName: string;
	projectId: string;
	sessionId: string;
	entrypoint: string;
	eventType: TriggerType;
	durationMs: number;
	timestamp: string;
	trendData: number[];
}

interface ErrorSessionsTableProps {
	data: ErrorSessionData[];
	className?: string;
	isLoading?: boolean;
}

const TableSkeleton = () => (
	<div className="animate-pulse">
		<div className="mb-4 h-6 w-40 rounded bg-gray-1050" />
		<div className="space-y-3">
			{Array.from({ length: 5 }).map((_, i) => (
				<div className="h-12 w-full rounded bg-gray-1050" key={i} />
			))}
		</div>
	</div>
);

const TriggerBadge = ({ type }: { type: TriggerType }) => {
	const label = triggerTypeLabels[type];
	const colorMap: Record<TriggerType, string> = {
		connection: "#3b82f6",
		webhook: "#22c55e",
		cron: "#f59e0b",
		manual: "#6b7280",
	};
	const color = colorMap[type];

	return (
		<span
			className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
			style={{ backgroundColor: `${color}20`, color }}
		>
			{label}
		</span>
	);
};

const Sparkline = ({ data }: { data: number[] }) => {
	const chartData = data.map((value, index) => ({ index, value }));

	return (
		<SparkAreaChart categories={["value"]} className="h-8 w-20" colors={["red"]} data={chartData} index="index" />
	);
};

export const ErrorSessionsTable = ({ data, className, isLoading = false }: ErrorSessionsTableProps) => {
	if (isLoading) {
		return (
			<div className={cn("rounded-xl bg-gray-1200 p-6 pt-0", className)}>
				<TableSkeleton />
			</div>
		);
	}

	if (data.length === 0) {
		return (
			<div className={cn("flex h-full items-center justify-center rounded-xl bg-gray-1200 p-6", className)}>
				<p className="text-gray-500">No error sessions found</p>
			</div>
		);
	}

	return (
		<div className={cn("rounded-xl bg-gray-1200 p-6 py-0", className)}>
			<Table className="mt-4 rounded-t-20 border border-gray-1050">
				<THead>
					<Tr>
						<Th className="w-1/6 min-w-28 pl-4">Project</Th>
						<Th className="w-1/6 min-w-32">Entrypoint</Th>
						<Th className="w-1/8 min-w-20">Trigger</Th>
						<Th className="w-1/8 min-w-20">Duration</Th>
						<Th className="w-1/8 min-w-24">Time</Th>
						<Th className="w-1/8 min-w-20">Trend</Th>
					</Tr>
				</THead>
				<TBody>
					{data.map((session) => (
						<Tr key={session.sessionId}>
							<Td className="w-1/6 min-w-28 pl-4">
								<span className="font-medium text-white">{session.projectName}</span>
							</Td>
							<Td className="w-1/6 min-w-32">
								<span className="font-mono text-xs text-gray-400">{session.entrypoint}</span>
							</Td>
							<Td className="w-1/8 min-w-20">
								<TriggerBadge type={session.eventType} />
							</Td>
							<Td className="w-1/8 min-w-20">
								<span className="text-gray-300">{formatDuration(session.durationMs)}</span>
							</Td>
							<Td className="w-1/8 min-w-24">
								<span className="text-gray-500">{session.timestamp}</span>
							</Td>
							<Td className="w-1/8 min-w-20">
								<Sparkline data={session.trendData} />
							</Td>
						</Tr>
					))}
				</TBody>
			</Table>
		</div>
	);
};
