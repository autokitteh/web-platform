import React, { useEffect, useState } from "react";

import { AnimatePresence, motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { ModalName, SidebarHrefMenu } from "@enums/components";
import { MenuProps } from "@interfaces/components";
import { LoggerService } from "@services/logger.service";
import { namespaces } from "@src/constants";
import { Project } from "@type/models";
import { cn } from "@utilities";

import { useModalStore, useProjectStore, useToastStore } from "@store";

import { Button, IconSvg } from "@components/atoms";
import { PopoverList, PopoverListContent, PopoverListTrigger } from "@components/molecules/popover/index";

import { NewProject, ProjectsIcon } from "@assets/image";

export const Menu = ({ className, isOpen = false }: MenuProps) => {
	const { t } = useTranslation(["menu", "errors"]);
	const { getProjectsList, projectsList } = useProjectStore();
	const navigate = useNavigate();
	const [sortedProjectsList, setSortedProjectsList] = useState<Project[]>([]);
	const { openModal } = useModalStore();
	const addToast = useToastStore((state) => state.addToast);
	const { projectId } = useParams();

	useEffect(() => {
		const sortedProjects = projectsList.slice().sort((a, b) => a.name.localeCompare(b.name));
		setSortedProjectsList(sortedProjects);
	}, [projectsList]);

	const animateVariant = {
		hidden: { opacity: 0, width: 0 },
		visible: { opacity: 1, transition: { duration: 0.35, ease: "easeOut" }, width: "auto" },
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
		fetchProjects();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<nav aria-label="Main navigation" className={cn(className, "flex flex-col gap-4")}>
			<ul className="ml-0 flex flex-col gap-2">
				<li>
					<Button
						ariaLabel={t("newProject")}
						className="w-full gap-1.5 p-0.5 pl-1 hover:bg-green-200 disabled:opacity-100"
						onClick={() => openModal(ModalName.newProject)}
						title={t("newProject")}
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
				</li>
				<PopoverList animation="slideFromLeft" interactionType="hover">
					<PopoverListTrigger>
						<li className="group">
							<div className="z-10 flex w-full items-center justify-start gap-1.5 rounded-full p-0.5 pl-1 text-gray-1100 group-hover:bg-green-200">
								<div className="flex size-9 items-center justify-center rounded-full">
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
						</li>
					</PopoverListTrigger>
					<PopoverListContent
						activeId={projectId}
						className={cn(
							"scrollbar z-30 flex h-screen flex-col overflow-scroll rounded-lg pb-16 pt-[212px] text-black",
							"mr-2.5 w-auto border-x border-gray-500 bg-gray-250 px-2"
						)}
						emptyListMessage={t("noProjectsFound")}
						itemClassName={cn(
							"flex cursor-pointer items-center gap-2.5 rounded-3xl p-2 transition hover:text-current",
							"text-center duration-300 whitespace-nowrap px-4 text-gray-1100 hover:bg-green-200",
							"max-w-245 overflow-hidden"
						)}
						items={sortedProjectsList.map(({ id, name }) => ({ id, label: name, value: id }))}
						onItemSelect={({ id: projectId }: { id: string }) =>
							navigate(`/${SidebarHrefMenu.projects}/${projectId}/code`)
						}
					/>
				</PopoverList>
			</ul>
		</nav>
	);
};
