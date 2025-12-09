import { ErrorStateProps } from "@interfaces/components/dashboardStats.interface";
import { cn } from "@utilities";

import { Button } from "@components/atoms/buttons";

import { WarningTriangleIcon } from "@assets/image/icons";

export const ErrorState = ({ title = "Something went wrong", message, onRetry, className }: ErrorStateProps) => (
	<div className={cn("flex flex-col items-center justify-center py-8 text-center", className)}>
		<div className="mb-3 text-red-500">
			<WarningTriangleIcon className="size-8" />
		</div>
		<h3 className="mb-1 text-base font-semibold text-gray-800">{title}</h3>
		<p className="mb-4 max-w-sm text-sm text-gray-600">{message}</p>
		{onRetry ? (
			<Button onClick={onRetry} variant="outline">
				Try again
			</Button>
		) : null}
	</div>
);
