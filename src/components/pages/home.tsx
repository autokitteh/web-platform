import React, { useEffect } from "react";
import { AppWrapper } from "@components/templates";
import { ProjectsService } from "@services/index";

export const Home = () => {
	const handleFetchData = async () => {
		const projects = await ProjectsService.list();
		console.log("projects", projects);
	};

	useEffect(() => {
		handleFetchData();
	}, []);

	return <AppWrapper>Home</AppWrapper>;
};
