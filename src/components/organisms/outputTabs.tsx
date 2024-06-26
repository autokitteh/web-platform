import React from "react";
import { Tab } from "@components/atoms";
import { OutputTabsVariants } from "@enums/components";

export const OutputTabs = () => {
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
			<div className="flex-auto h-48 pt-6 overflow-auto scrollbar mt-4">
				<p className="text-error-200">Failed: 04.27.23 14:20</p>
				<p className="mt-3 text-error-200">Lorem Ipsum</p>
			</div>
		</div>
	);
};
