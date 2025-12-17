import { EmptyStateProps } from "@interfaces/components/dashboardStats.interface";
import { cn } from "@utilities";

export const EmptyState = ({ title, description, icon, action, className }: EmptyStateProps) => (
	<div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
		{icon ? <div className="mb-4 text-gray-400">{icon}</div> : null}
		<h3 className="mb-2 text-lg font-semibold text-gray-800">{title}</h3>
		{description ? <p className="mb-4 max-w-sm text-sm text-gray-600">{description}</p> : null}
		{action ? <div className="mt-2">{action}</div> : null}
	</div>
);
