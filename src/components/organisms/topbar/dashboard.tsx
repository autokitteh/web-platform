import React from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { isAuthEnabled } from "@constants";
import { SidebarHrefMenu } from "@enums/components";

import { useProjectStore, useToastStore, useUserStore } from "@store";

import { Button, IconSvg, Typography } from "@components/atoms";

import { PlusAccordionIcon } from "@assets/image/icons";

export const DashboardTopbar = () => {
	const { logoutFunction } = useUserStore();
	const { t } = useTranslation("dashboard", { keyPrefix: "topbar" });
	const { user } = useUserStore();
	const { addProjectToMenu, createProject } = useProjectStore();
	const navigate = useNavigate();
	const addToast = useToastStore((state) => state.addToast);
	const userName = user?.name || "";

	const handleCreateProject = async () => {
		const { data, error } = await createProject();

		if (error) {
			addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
			});

			return;
		}

		const menuProject = {
			href: `/${SidebarHrefMenu.projects}/${data?.projectId}`,
			id: data!.projectId,
			name: data!.name,
		};

		addProjectToMenu(menuProject);

		navigate(`/${SidebarHrefMenu.projects}/${data?.projectId}`);
	};

	return (
		<div className="mt-6 flex">
			<Typography className="font-averta-bold w-full text-3xl font-bold text-black" element="h1">
				{t("hello")} {userName ? `, ${userName}` : null}
			</Typography>

			<Button
				className="gap-5 whitespace-nowrap rounded-xl py-2.5 pl-3 pr-4"
				onClick={handleCreateProject}
				variant="filled"
			>
				<IconSvg className="fill-white" size="lg" src={PlusAccordionIcon} />

				{t("buttons.newProject")}
			</Button>

			{isAuthEnabled ? (
				<Button
					className="ml-2 gap-5 whitespace-nowrap rounded-xl py-2.5"
					onClick={logoutFunction}
					variant="filled"
				>
					{t("buttons.logout")}
				</Button>
			) : null}
		</div>
	);
};
