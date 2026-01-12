import React, { useEffect, useState } from "react";

import { AnimatePresence, motion } from "motion/react";
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

	const animateVariant = {
		hidden: { opacity: 0, width: 0 },
		visible: { opacity: 1, transition: { duration: 0.35, ease: "easeOut" as const }, width: "auto" },
	};

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

	return (
		<nav aria-label="Main navigation" className={cn(className, "flex flex-col gap-4")}>
			<ul className="ml-0 flex flex-col gap-2">
				<li>
					<Tooltip content={t("newProject")} hide={isOpen} position="right">
						<Button
							ariaLabel={t("newProject")}
							className="w-full gap-1.5 p-0.5 hover:bg-green-200 disabled:opacity-100"
							onClick={() => navigate("/welcome")}
						>
							<div className="flex size-9 items-center justify-center">
								<IconSvg alt={t("newProject")} size="xl" src={NewProject} />
							</div>

							<AnimatePresence>
								{isOpen ? (
									<motion.span
										animate="visible"
										className="overflow-hidden whitespace-nowrap"
										exit="hidden"
										initial="hidden"
										variants={animateVariant}
									>
										{t("newProject")}
									</motion.span>
								) : null}
							</AnimatePresence>
						</Button>
					</Tooltip>
				</li>
				<PopoverListWrapper animation="slideFromLeft" interactionType="click">
					<PopoverListTrigger>
						<li className="group">
							<Tooltip content={t("myProjects")} hide={isOpen} position="right">
								<div className="relative z-10 flex w-full items-center justify-start gap-1.5 rounded-full p-0.5 text-gray-1100 group-hover:bg-green-200">
									<div className="flex size-9 items-center justify-center">
										<IconSvg
											alt={t("myProjects")}
											className="fill-gray-1100"
											size="xl"
											src={ProjectsIcon}
										/>
									</div>

									<AnimatePresence>
										{isOpen ? (
											<motion.span
												animate="visible"
												className="overflow-hidden whitespace-nowrap"
												exit="hidden"
												initial="hidden"
												variants={animateVariant}
											>
												{t("myProjects")}
											</motion.span>
										) : null}
									</AnimatePresence>
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
							"hover:text-current flex cursor-pointer items-center gap-2.5 rounded-3xl p-2 transition",
							"whitespace-nowrap px-4 text-center text-gray-1100 duration-300 hover:bg-green-200",
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
