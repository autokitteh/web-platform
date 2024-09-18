import React, { useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { dashboardProjectsCards } from "@src/constants";
import { SidebarHrefMenu } from "@src/enums/components";
import { Project } from "@type/models";

import { useSort } from "@hooks";
import { useProjectStore, useToastStore } from "@store";

import { Button, IconSvg, Link, Spinner, TBody, THead, Table, Td, Th, Tr, Typography } from "@components/atoms";
import { SortButton } from "@components/molecules";
import { DashboardProjectsTableCard } from "@components/organisms/dashboard";

import { StartFromTemplateImage } from "@assets/image";
import { ArrowStartTemplateIcon, PlusAccordionIcon } from "@assets/image/icons";
import { GithubIcon, LinkedInIcon, RedditIcon, TelegramIcon } from "@assets/image/icons/dashboard";

export const DashboardProjectsTable = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "projects" });
	const { createProject, projectsList } = useProjectStore();
	const navigate = useNavigate();
	const [loadingNewProject, setLoadingNewProject] = useState(false);
	const addToast = useToastStore((state) => state.addToast);

	const { items: sortedProjects, requestSort, sortConfig } = useSort<Project>(projectsList, "name");

	const handleCreateProject = async () => {
		setLoadingNewProject(true);
		const { data, error } = await createProject();
		setLoadingNewProject(false);
		if (error) {
			addToast({
				message: (error as Error).message,
				type: "error",
			});

			return;
		}

		navigate(`/${SidebarHrefMenu.projects}/${data?.projectId}`);
	};

	return (
		<div className="z-10 mt-10 h-full select-none">
			{sortedProjects.length ? (
				<Table className="mt-2.5 max-h-96 rounded-t-20 shadow-2xl">
					<THead>
						<Tr className="border-none pl-6">
							<Th className="group h-11 cursor-pointer font-normal" onClick={() => requestSort("name")}>
								{t("table.columns.projectName")}

								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"name" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>
						</Tr>
					</THead>

					<TBody>
						{sortedProjects.map(({ href, id, name }) => (
							<Tr className="group cursor-pointer border-none pl-6" key={id}>
								<Td className="group-hover:font-bold" onClick={() => navigate(href)}>
									{name}
								</Td>
							</Tr>
						))}
					</TBody>
				</Table>
			) : null}

			<div className="mt-5 flex flex-col items-center justify-center">
				<Button
					className="gap-2.5 whitespace-nowrap rounded-full border border-gray-750 py-2.5 pl-3 pr-4 font-averta text-base font-semibold"
					disabled={loadingNewProject}
					onClick={handleCreateProject}
					variant="filled"
				>
					<IconSvg className="fill-white" size="lg" src={!loadingNewProject ? PlusAccordionIcon : Spinner} />

					{t("buttons.startNewProject")}
				</Button>

				<div className="relative ml-5 mt-4">
					<StartFromTemplateImage />

					<ArrowStartTemplateIcon className="absolute -top-4 left-52" />
				</div>
			</div>

			<div className="mt-8 grid grid-cols-auto-fit-290 gap-5 border-t-2 border-gray-1050 pt-6">
				{dashboardProjectsCards.map((card, index) => (
					<DashboardProjectsTableCard card={card} isCreating={false} key={index} onCreateClick={() => {}} />
				))}

				<div className="rounded-md border-2 border-gray-1050 bg-gray-1100 px-5 pb-4 pt-6 font-averta">
					<div className="flex items-center gap-2.5">
						<Link className="hover:scale-110" target="_blank" to="https://www.reddit.com/r/autokitteh/">
							<RedditIcon />
						</Link>

						<Link
							className="hover:scale-110"
							target="_blank"
							to="https://www.linkedin.com/company/autokitteh/"
						>
							<LinkedInIcon />
						</Link>

						<Link className="hover:scale-110" target="_blank" to="https://discord.gg/UhnJuBarZQ">
							<TelegramIcon />
						</Link>

						<Link className="hover:scale-110" target="_blank" to="https://github.com/autokitteh/autokitteh">
							<GithubIcon />
						</Link>
					</div>

					<Typography className="mt-4 font-semibold uppercase text-green-200" element="h3" size="large">
						JOIN THE COMMUNITY
					</Typography>

					<Typography className="mt-1" element="p">
						See how our community is creating projects
					</Typography>
				</div>
			</div>
		</div>
	);
};
