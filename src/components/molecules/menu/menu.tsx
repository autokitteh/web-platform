import React, { useEffect, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

import { SidebarHrefMenu } from "@enums/components";
import { MenuProps, SubmenuInfo } from "@interfaces/components";
import { Project } from "@type/models";
import { cn } from "@utilities";

import { useProjectStore, useToastStore } from "@store";

import { Button, IconSvg } from "@components/atoms";

import { NewProject, ProjectsIcon } from "@assets/image";

export const Menu = ({ className, isOpen = false, onSubmenu }: MenuProps) => {
	const { t } = useTranslation(["menu", "errors"]);
	const navigate = useNavigate();
	const location = useLocation();
	const { addProjectToMenu, createProject, getProjectsList, projectsList } = useProjectStore();
	const addToast = useToastStore((state) => state.addToast);
	const [sortedProjectsList, setSortedProjectsList] = useState<Project[]>([]);

	useEffect(() => {
		if (projectsList.length) {
			const sortedProjects = projectsList.slice().sort((a, b) => a.name.localeCompare(b.name));
			setSortedProjectsList(sortedProjects);
		}
	}, [projectsList]);

	const animateVariant = {
		hidden: { opacity: 0, width: 0 },
		visible: { opacity: 1, transition: { duration: 0.35, ease: "easeOut" }, width: "auto" },
	};

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

	useEffect(() => {
		getProjectsList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleMouseEnter = (event: React.MouseEvent, submenu?: SubmenuInfo["submenu"]) => {
		onSubmenu?.({ submenu, top: event.currentTarget.getBoundingClientRect().top + 5 });
	};

	const isButtonActive = (href: string) => location.pathname.startsWith(href);

	const buttonMenuStyle = (href: string) =>
		cn("gap-1.5 p-0.5 pl-1 hover:bg-green-light", {
			"bg-gray-700": isButtonActive(href) && isOpen,
			"text-white hover:bg-gray-700": isButtonActive(href),
		});

	const buttonMenuIconStyle = (href: string) =>
		cn("fill-gray-700", {
			"fill-white p-0.5": isButtonActive(href),
		});

	const buttonMenuIconWrapperStyle = (href: string) =>
		cn("flex h-9 w-9 items-center justify-center rounded-full duration-500", {
			"bg-gray-700 hover:bg-gray-700": isButtonActive(href) && !isOpen,
		});

	return (
		<nav aria-label="Main navigation" className={cn(className, "flex flex-col gap-4")}>
			<ul>
				<li onMouseEnter={(event) => handleMouseEnter(event)}>
					<Button
						ariaLabel="New Project"
						className="gap-1.5 p-0.5 pl-1 hover:bg-green-light"
						onClick={handleCreateProject}
					>
						<div className="flex h-9 w-9 items-center justify-center">
							<IconSvg alt="New Project" size="xl" src={NewProject} />
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

				<li onMouseEnter={(event) => handleMouseEnter(event, sortedProjectsList)}>
					<Button ariaLabel={t("myProjects")} className={buttonMenuStyle("#")} href="#">
						<div className={buttonMenuIconWrapperStyle("#")}>
							<IconSvg
								alt={t("myProjects")}
								className={buttonMenuIconStyle("#")}
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
					</Button>
				</li>
			</ul>
		</nav>
	);
};
