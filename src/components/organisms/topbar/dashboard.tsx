import React, { useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { SidebarHrefMenu } from "@enums/components";
import { defaultProjectFile } from "@src/constants";

import { useProjectStore, useToastStore, useUserStore } from "@store";

import { Button, IconSvg, Spinner, Typography } from "@components/atoms";

import { PlusAccordionIcon } from "@assets/image/icons";

export const DashboardTopbar = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "topbar" });
	const { user } = useUserStore();
	const { createProject } = useProjectStore();
	const [loadingNewProject, setLoadingNewProject] = useState(false);
	const navigate = useNavigate();
	const addToast = useToastStore((state) => state.addToast);
	const userName = user?.name || "";

	const handleCreateProject = async () => {
		setLoadingNewProject(true);
		const { data, error } = await createProject(true);
		setLoadingNewProject(false);
		if (error) {
			addToast({
				message: (error as Error).message,
				type: "error",
			});

			return;
		}

		const projectId = data?.projectId;

		navigate(`/${SidebarHrefMenu.projects}/${projectId}`, {
			state: { fileToOpen: defaultProjectFile },
		});
	};

	return (
		<div className="flex flex-wrap">
			<Typography className="w-full font-averta text-3xl font-semibold" element="h2">
				{t("hello")} {userName ? `, ${userName}` : null}
			</Typography>

			<div className="mt-1 flex w-full items-end justify-between">
				<Typography className="w-full font-averta text-4xl font-semibold" element="h1">
					{t("welcome")}
				</Typography>

				<Button
					className="gap-2.5 whitespace-nowrap rounded-full border border-gray-750 py-2.5 pl-3 pr-4 font-averta text-base font-semibold"
					disabled={loadingNewProject}
					onClick={handleCreateProject}
					variant="filled"
				>
					<IconSvg className="fill-white" size="lg" src={!loadingNewProject ? PlusAccordionIcon : Spinner} />

					{t("buttons.newProject")}
				</Button>
			</div>
		</div>
	);
};
