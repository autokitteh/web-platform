import React from "react";
import { Tabs, Tab, TabList, TabPanel } from "@components/atoms";
import { OutputTabsVariants } from "@enums/components";

export const OutputTabs = () => {
	return (
		<Tabs defaultValue={OutputTabsVariants.output}>
			<TabList className="uppercase">
				<Tab value={OutputTabsVariants.output}>OUTPUT</Tab>
				<Tab value={OutputTabsVariants.tab}>TAB</Tab>
			</TabList>
			<TabPanel className="flex-auto h-48 pt-6 overflow-auto scrollbar" value={OutputTabsVariants.output}>
				<p className="text-error-200">Failed: 04.27.23 14:20</p>
				<p className="mt-3 text-error-200">Lorem Ipsum</p>
			</TabPanel>
			<TabPanel className="flex-auto h-48 pt-6 overflow-hidden scrollbar" value={OutputTabsVariants.tab}>
				<p className="text-error-200">Failed: Lorem Ipsum</p>
			</TabPanel>
		</Tabs>
	);
};
