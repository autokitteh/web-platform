import React from "react";

import { cn } from "@utilities";

interface WorkflowBuilderSkeletonProps {
	className?: string;
}

const SkeletonNode = ({ className }: { className?: string }) => (
	<div className={cn("rounded-lg border border-gray-750 bg-gray-900 p-4", className)}>
		<div className="mb-2 h-4 w-20 animate-pulse rounded bg-gray-700" />
		<div className="h-3 w-32 animate-pulse rounded bg-gray-750" />
	</div>
);

const SkeletonEdge = ({ className }: { className?: string }) => (
	<div className={cn("h-0.5 animate-pulse bg-gray-700", className)} />
);

export const WorkflowBuilderSkeleton = ({ className }: WorkflowBuilderSkeletonProps) => {
	return (
		<div
			className={cn("relative flex size-full items-center justify-center bg-gray-1100", className)}
			data-testid="workflow-builder-skeleton"
		>
			<div className="flex flex-col items-center gap-8">
				<div className="flex gap-6">
					<SkeletonNode className="h-20 w-40" />
					<SkeletonNode className="h-20 w-40" />
				</div>

				<div className="flex items-center gap-4">
					<SkeletonEdge className="w-16 rotate-45" />
					<SkeletonEdge className="w-16 -rotate-45" />
				</div>

				<div className="flex gap-6">
					<SkeletonNode className="h-24 w-48" />
					<SkeletonNode className="h-24 w-48" />
					<SkeletonNode className="h-24 w-48" />
				</div>

				<div className="flex items-center gap-4">
					<SkeletonEdge className="w-12 rotate-45" />
					<SkeletonEdge className="w-16" />
					<SkeletonEdge className="w-12 -rotate-45" />
				</div>

				<div className="flex gap-6">
					<SkeletonNode className="h-16 w-32" />
					<SkeletonNode className="h-16 w-32" />
				</div>

				<p className="mt-4 animate-pulse text-sm text-gray-500">Loading workflow...</p>
			</div>
		</div>
	);
};
