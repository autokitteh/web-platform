import React, { useEffect } from "react";
import { Tabs, Tab, TabList, TabPanel } from "@components/atoms";
import { FrameNavigation } from "@components/organisms";
import { AppWrapper } from "@components/templates";
import { ProjectsService } from "@services";
import { tabsMainValue } from "@utils";

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
			<FrameNavigation>
				<Tabs defaultValue={1}>
					<TabList className="uppercase">
						{tabsMainValue.map(({ id, title, count }) => (
							<Tab key={id} value={id}>{`${title} (${count})`}</Tab>
						))}
					</TabList>
					{tabsMainValue.map(({ id, content }) => (
						<TabPanel key={id} value={id}>
							{content}
						</TabPanel>
					))}
				</Tabs>
			</FrameNavigation>
		</AppWrapper>
	);
};
