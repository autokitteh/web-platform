import React from "react";
import { Tab } from "@components/atoms";
import { OutputTabsVariants } from "@enums/components";

export const OutputTabs = () => {
	return (
		<div className="flex flex-col flex-1 h-full">
			<div
				className={
					`flex items-center gap-1 xl:gap-2 2xl:gap-4 3xl:gap-5 select-none` +
					`overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar uppercase`
				}
			>
				<Tab activeTab={OutputTabsVariants.output} value={OutputTabsVariants.output}>
					output
				</Tab>
			</div>
			<div className="flex-auto h-48 pt-6 overflow-auto scrollbar">
				<p className="text-error-200">Failed: 04.27.23 14:20</p>
				<p className="mt-3 text-error-200">Lorem Ipsum</p>
			</div>
		</div>
	);
};
