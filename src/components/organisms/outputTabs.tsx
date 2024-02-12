import React from "react";
import { Tabs, Tab, TabList, TabPanel } from "@components/atoms";

export const OutputTabs = () => {
	return (
		<Tabs defaultValue="output">
			<TabList className="uppercase">
				<Tab value="output">OUTPUT</Tab>
				<Tab value="tab">TAB</Tab>
			</TabList>
			<TabPanel className="flex-auto pt-6 overflow-auto scrollbar h-48" value="output">
				<p className="text-error-200">Failed: 04.27.23 14:20</p>
				<p className="text-error-200 mt-3">Lorem Ipsum</p>
			</TabPanel>
			<TabPanel className="flex-auto pt-6 overflow-hidden scrollbar h-48" value="tab">
				<p className="text-error-200">Failed: Lorem Ipsum</p>
			</TabPanel>
		</Tabs>
	);
};
