import { sessionStatusHex, sessionStatusLabels, SessionStatus } from "@constants";
import { cn } from "@utilities";
import { formatDuration } from "@utilities/fakeDashboardData";

import { TBody, THead, Table, Td, Th, Tr } from "@components/atoms";

interface RecentSessionData {
	projectName: string;
	projectId: string;
	sessionId: string;
	status: SessionStatus;
	durationMs: number;
	lastActivityTime: string;
}

interface RecentSessionsTableProps {
	data: RecentSessionData[];
	className?: string;
	title?: string;
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

const StatusBadge = ({ status }: { status: SessionStatus }) => {
	const color = sessionStatusHex[status];
	const label = sessionStatusLabels[status];

	return (
		<span
			className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
			style={{ backgroundColor: `${color}20`, color }}
		>
			{label}
		</span>
	);
};

export const RecentSessionsTable = ({
	data,
	className,
	title = "Recent Sessions",
	isLoading = false,
}: RecentSessionsTableProps) => {
	if (isLoading) {
		return (
			<div className={cn("rounded-xl border border-gray-1050 bg-gray-1200 p-6", className)}>
				<TableSkeleton />
			</div>
		);
	}

	return (
		<div className={cn("rounded-xl border border-gray-1050 bg-gray-1200 p-6", className)}>
			<h3 className="mb-4 text-lg font-semibold text-white">{title}</h3>
			<Table className="mt-4 rounded-t-20">
				<THead>
					<Tr>
						<Th>Project</Th>
						<Th>Session ID</Th>
						<Th>Status</Th>
						<Th>Duration</Th>
						<Th>Last Activity</Th>
					</Tr>
				</THead>
				<TBody>
					{data.map((session) => (
						<Tr key={session.sessionId}>
							<Td>
								<span className="font-medium text-white">{session.projectName}</span>
							</Td>
							<Td>
								<span className="font-mono text-xs text-gray-400">{session.sessionId}</span>
							</Td>
							<Td>
								<StatusBadge status={session.status} />
							</Td>
							<Td>
								<span className="text-gray-300">{formatDuration(session.durationMs)}</span>
							</Td>
							<Td>
								<span className="text-gray-500">{session.lastActivityTime}</span>
							</Td>
						</Tr>
					))}
				</TBody>
			</Table>
		</div>
	);
};
