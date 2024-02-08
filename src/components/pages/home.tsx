import React, { useState, useEffect } from "react";
import { Close } from "@assets/image/icons";
import { Tabs, Tab, TabList, TabPanel, IconButton, Button } from "@components/atoms";
import { Modal } from "@components/molecules";
import { SplitFrame } from "@components/organisms";
import { AppWrapper } from "@components/templates";
import { tabsMainFrame } from "@constants";
import { ProjectsService } from "@services";

export const Home = () => {
	const [modals, setModals] = useState({
		firstModal: false,
		secondModal: false,
	});

	const toggleModal = (modalName: string) => {
		setModals((prevModals: any) => ({
			...prevModals,
			[modalName]: !prevModals[modalName],
		}));
	};

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
					<TabList>
						{tabsMainFrame.map(({ id, title, count }) => (
							<Tab key={id} value={id}>{`${title} (${count})`}</Tab>
						))}
						<IconButton
							className="bg-black p-0 w-6.5 h-6.5 hover:bg-black group ml-auto"
							onClick={() => toggleModal("firstModal")}
						>
							<Close className="transition w-3 h-3 fill-gray-400 group-hover:fill-white" />
						</IconButton>
					</TabList>
					{tabsMainFrame.map(({ id, content }) => (
						<TabPanel key={id} value={id}>
							{content()}
						</TabPanel>
					))}
				</Tabs>
			</SplitFrame>
			<Modal isOpen={modals.firstModal} onClose={() => toggleModal("firstModal")}>
				<div className="mx-6">
					<h3 className="text-xl font-bold mb-5">Delete Connection</h3>
					<p>
						This connection you are about to delete is used in <br />
						<strong>3 projects, 2 of them are currently running.</strong>
					</p>
					<br />
					<p>
						Deleting the connection may cause failure of projects. <br /> Are you sure you want to delete this
						connection?
					</p>
				</div>
				<div className="flex justify-end gap-1 mt-14">
					<Button className="font-semibold py-3 px-4 hover:text-white w-auto" onClick={() => toggleModal("firstModal")}>
						Cancel
					</Button>
					<Button
						className="font-semibold py-3 px-4 bg-gray-700 w-auto"
						onClick={() => toggleModal("secondModal")}
						variant="filled"
					>
						Yes, delete
					</Button>
				</div>
			</Modal>

			<Modal isOpen={modals.secondModal} onClose={() => toggleModal("secondModal")}>
				Second Modal Content
			</Modal>
		</AppWrapper>
	);
};
