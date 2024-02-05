import React, { useEffect } from "react";
import { Tabs, Tab, TabList, TabPanel } from "@components/atoms";
import { SplitFrame } from "@components/organisms";
import { AppWrapper } from "@components/templates";
import { ProjectsService } from "@services";
import { tabsMainFrame } from "@utils";

export const Home = () => {
	const handleFetchData = async () => {
		const projects = await ProjectsService.list();
		console.log("projects", projects);
	};

	useEffect(() => {
		handleFetchData();
	}, []);

	return (
		<AppWrapper>
			<SplitFrame>
				<Tabs defaultValue={2}>
					<TabList className="uppercase">
						{tabsMainFrame.map(({ id, title, count }) => (
							<Tab key={id} value={id}>{`${title} (${count})`}</Tab>
						))}
					</TabList>
					{tabsMainFrame.map(({ id, content }) => (
						<TabPanel key={id} value={id}>
							{content}
						</TabPanel>
					))}
				</Tabs>
			</SplitFrame>
		</AppWrapper>
	);
};
