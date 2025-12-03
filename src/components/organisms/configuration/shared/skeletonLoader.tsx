import { SkeletonLoaderProps } from "@src/interfaces/components";
import { cn } from "@src/utilities";

export const SkeletonLoader = ({ className }: SkeletonLoaderProps) => (
	<div className={cn("animate-pulse rounded bg-gray-700", className)} />
);
