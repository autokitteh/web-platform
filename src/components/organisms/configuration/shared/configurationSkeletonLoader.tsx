import React from "react";

import { SkeletonLoader } from "../../../molecules/shared/skeletonLoader";

export const ConfigurationSkeletonLoader = () => {
	return (
		<div className="h-5 space-y-2">
			<div className="relative flex flex-row items-center justify-between rounded-lg border border-gray-700 bg-gray-900 p-2">
				<div className="ml-2 flex flex-1 items-center gap-2">
					<SkeletonLoader className="h-5 w-1/3" />
				</div>
				<div className="flex items-center gap-1">
					<SkeletonLoader className="size-5" />
					<SkeletonLoader className="size-5" />
					<SkeletonLoader className="h-5 w-20" />
				</div>
			</div>
		</div>
	);
};
export { SkeletonLoader };
