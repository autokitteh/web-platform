import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { SidebarHrefMenu } from "@enums/components";
import { MenuProps } from "@interfaces/components";
import { LoggerService } from "@services/logger.service";
import { descopeProjectId, namespaces } from "@src/constants";
import { Project } from "@type/models";
import { cn } from "@utilities";

import { useOrganizationStore, useProjectStore, useSharedBetweenProjectsStore, useToastStore } from "@store";

import { Button, IconSvg, Tooltip } from "@components/atoms";
import { PopoverListWrapper, PopoverListContent, PopoverListTrigger } from "@components/molecules/popover";

import { NewProject, ProjectsIcon } from "@assets/image";

export const ProjectsMenu = ({ className, isOpen = false }: MenuProps) => {
	const { t } = useTranslation(["menu", "errors"]);
	const { getProjectsList, projectsList } = useProjectStore();
	const navigate = useNavigate();
	const { projectId } = useParams();
	const addToast = useToastStore((state) => state.addToast);
	const [sortedProjectsList, setSortedProjectsList] = useState<Project[]>([]);
	const { user } = useOrganizationStore();
	const { drawers, settingsPath } = useSharedBetweenProjectsStore();

	useEffect(() => {
		const sortedProjects = projectsList.slice().sort((a, b) => a.name.localeCompare(b.name));
		setSortedProjectsList(sortedProjects);
	}, [projectsList]);

	const fetchProjects = async () => {
		const { error } = await getProjectsList();
		if (error) {
			addToast({
				message: t("projectsListFetchFailed"),
				type: "error",
			});

			LoggerService.error(
				namespaces.ui.menu,
				t("projectsListFetchFailedExtended", {
					error,
				})
			);
		}
	};

	useEffect(() => {
		if (!descopeProjectId) {
			fetchProjects();
			return;
		}
		if (user) {
			fetchProjects();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const mobileButtonClass =
		"w-full !justify-start gap-4 rounded-xl px-4 py-3.5 text-lg text-left hover:bg-green-200 active:bg-green-400 min-h-[52px]";
	const desktopButtonClass = "gap-1.5 p-0.5 hover:bg-green-200 disabled:opacity-100";

	return (
		<nav aria-label="Main navigation" className={cn(className, "flex flex-col gap-4")}>
			<ul className={cn("ml-0 flex flex-col", isOpen ? "gap-2" : "gap-2")}>
				<li>
					<Tooltip content={t("newProject")} hide={isOpen} position="right">
						<Button
							ariaLabel={t("newProject")}
							className={isOpen ? mobileButtonClass : desktopButtonClass}
							onClick={() => navigate("/ai")}
						>
							<div className={cn("flex", isOpen ? "size-10" : "size-9")}>
								<IconSvg alt={t("newProject")} size="xl" src={NewProject} />
							</div>

							{isOpen ? <span className="whitespace-nowrap">{t("newProject")}</span> : null}
						</Button>
					</Tooltip>
				</li>
				<PopoverListWrapper animation="slideFromLeft" interactionType="click">
					<PopoverListTrigger>
						<li className="group">
							<Tooltip content={t("myProjects")} hide={isOpen} position="right">
								<div
									className={cn(
										"relative z-10 flex text-gray-1100",
										isOpen
											? "min-h-[52px] w-full items-center gap-4 rounded-xl px-4 py-3.5 text-lg hover:bg-green-200 active:bg-green-400"
											: "gap-1.5 rounded-full p-0.5 group-hover:bg-green-200"
									)}
								>
									<div className={cn("flex", isOpen ? "size-10" : "size-9")}>
										<IconSvg
											alt={t("myProjects")}
											className="fill-gray-1100"
											size="xl"
											src={ProjectsIcon}
										/>
									</div>

									{isOpen ? <span className="whitespace-nowrap">{t("myProjects")}</span> : null}
								</div>
							</Tooltip>
						</li>
					</PopoverListTrigger>
					<PopoverListContent
						activeId={projectId}
						className={cn(
							"scrollbar z-20 flex h-screen flex-col overflow-scroll pb-16 pt-[212px] text-black",
							"mr-2.5 w-auto border-x border-gray-500 bg-gray-250 px-2"
						)}
						emptyListMessage={t("noProjectsFound")}
						itemClassName={cn(
							"hover:text-current flex cursor-pointer gap-2.5 rounded-3xl p-2 transition",
							"whitespace-nowrap px-4 text-gray-1100 duration-300 hover:bg-green-200",
							"overflow-hidden"
						)}
						items={sortedProjectsList.map(({ id, name }) => ({ id, label: name, value: id }))}
						onItemSelect={({ id: selectedProjectId }: { id: string }) => {
							const isSettingsDrawerOpen = drawers[selectedProjectId]?.settings === true;
							const storedSettingsPath = settingsPath[selectedProjectId];
							const basePath = `/${SidebarHrefMenu.projects}/${selectedProjectId}/explorer`;
							const fullPath =
								isSettingsDrawerOpen && storedSettingsPath
									? `${basePath}/${storedSettingsPath}`
									: basePath;
							navigate(fullPath);
						}}
					/>
				</PopoverListWrapper>
			</ul>
		</nav>
	);
};
