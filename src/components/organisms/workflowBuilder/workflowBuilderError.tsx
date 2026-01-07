import React from "react";

import { LuTriangleAlert } from "react-icons/lu";

import { cn } from "@utilities";

import { Button } from "@components/atoms/buttons";

interface WorkflowBuilderErrorProps {
	error: string;
	onRetry?: () => void;
	onDismiss?: () => void;
	className?: string;
}

export const WorkflowBuilderError = ({ error, onRetry, onDismiss, className }: WorkflowBuilderErrorProps) => {
	return (
		<div
			className={cn(
				"relative flex size-full flex-col items-center justify-center gap-4 bg-gray-1100 p-8",
				className
			)}
			data-testid="workflow-builder-error"
			role="alert"
		>
			<div className="flex flex-col items-center gap-3">
				<div className="flex size-16 items-center justify-center rounded-full bg-error/10">
					<LuTriangleAlert className="size-8 text-error" />
				</div>

				<h3 className="text-lg font-semibold text-gray-200">Failed to Load Workflow</h3>

				<p className="max-w-md text-center text-sm text-gray-500">{error}</p>
			</div>

			<div className="flex gap-3">
				{onRetry ? (
					<Button ariaLabel="Retry loading workflow" onClick={onRetry} variant="filled">
						Retry
					</Button>
				) : null}

				{onDismiss ? (
					<Button ariaLabel="Dismiss error" onClick={onDismiss} variant="outline">
						Dismiss
					</Button>
				) : null}
			</div>
		</div>
	);
};
