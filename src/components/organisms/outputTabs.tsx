import React from "react";
import { Tab } from "@components/atoms";
import { OutputTabsVariants } from "@enums/components";
import { useLoggerStore } from "@store";

export const OutputTabs: React.FC = () => {
	const logs = useLoggerStore((state) => state.logs);

	return (
		<div className="flex flex-col flex-1">
			<div
				className={
					`static top-4 h-8 uppercase flex items-center gap-1 xl:gap-2 2xl:gap-4 3xl:gap-5 select-none ` +
					`overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar mb-2`
				}
			>
				<Tab activeTab={OutputTabsVariants.output} value={OutputTabsVariants.output}>
					output
				</Tab>
			</div>
			<div className="flex-auto h-48 pt-6 mt-4 overflow-auto scrollbar">
				{logs.map(({ id, timestamp, message }) => (
					<div className="mb-4" key={id}>
						<p className="font-medium text-gray-200">{timestamp}</p>
						<p className="text-error-200">{message}</p>
					</div>
				))}
			</div>
		</div>
	);
};
