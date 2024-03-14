import React from "react";
import { Close } from "@assets/image/icons";
import { Tabs, Tab, TabList, TabPanel, IconButton } from "@components/atoms";
import { AppWrapper, MapMenuFrameLayout } from "@components/templates";
import { tabsMainFrame } from "@constants";

export const Project = () => {
	return (
		<AppWrapper>
			<MapMenuFrameLayout>
				<Tabs defaultValue={1}>
					<TabList>
						{tabsMainFrame.map(({ id, title, count }) => (
							<Tab className="text-xs 3xl:text-sm" key={id} value={id}>
								{`${title} (${count})`}
							</Tab>
						))}
						<IconButton className="bg-black p-0 w-6.5 h-6.5 hover:bg-black group ml-auto ">
							<Close className="transition w-3 h-3 fill-gray-400 group-hover:fill-white" />
						</IconButton>
					</TabList>
					{tabsMainFrame.map(({ id, content }) => (
						<TabPanel key={id} value={id}>
							{content()}
						</TabPanel>
					))}
				</Tabs>
			</MapMenuFrameLayout>
		</AppWrapper>
	);
};
