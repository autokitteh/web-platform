import React, { useEffect, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

import { SidebarHrefMenu } from "@enums/components";
import { MenuProps, SubmenuInfo } from "@interfaces/components";
import { defaultProjectFile } from "@src/constants";
import { Project } from "@type/models";
import { cn } from "@utilities";

import { useProjectStore, useToastStore } from "@store";

import { Button, IconSvg, Loader } from "@components/atoms";

import { NewProject, ProjectsIcon } from "@assets/image";

export const Menu = ({ className, isOpen = false, onMouseLeave, onSubmenu }: MenuProps) => {
	const { t } = useTranslation(["menu", "errors"]);
	const navigate = useNavigate();
	const location = useLocation();
	const { createProject, getProjectsList, projectsList } = useProjectStore();
	const addToast = useToastStore((state) => state.addToast);
	const [sortedProjectsList, setSortedProjectsList] = useState<Project[]>([]);
	const [isCreatingProject, setIsCreatingProject] = useState(false);

	useEffect(() => {
		const sortedProjects = projectsList.slice().sort((a, b) => a.name.localeCompare(b.name));
		setSortedProjectsList(sortedProjects);
	}, [projectsList]);

	const animateVariant = {
		hidden: { opacity: 0, width: 0 },
		visible: { opacity: 1, transition: { duration: 0.35, ease: "easeOut" }, width: "auto" },
	};

	const handleCreateProject = async () => {
		setIsCreatingProject(true);
		const { data, error } = await createProject(false);
		setIsCreatingProject(false);

		if (error) {
			addToast({
				message: (error as Error).message,
				type: "error",
			});

			return;
		}

		const projectId = data!.projectId;

		navigate(`/${SidebarHrefMenu.projects}/${projectId}/code`, {
			state: { fileToOpen: defaultProjectFile },
		});
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
		cn("relative z-10 w-full gap-1.5 p-0.5 pl-1 group-hover:bg-green-200", {
			"bg-gray-1100": isButtonActive(href) && isOpen,
			"text-white hover:bg-gray-1100": isButtonActive(href),
		});

	const buttonMenuIconStyle = (href: string) =>
		cn("fill-gray-1100", {
			"fill-white p-0.5": isButtonActive(href),
		});

	const buttonMenuIconWrapperStyle = (href: string) =>
		cn("flex h-9 w-9 items-center justify-center rounded-full duration-500", {
			"bg-gray-1100 hover:bg-gray-1100": isButtonActive(href) && !isOpen,
		});

	return (
		<nav aria-label="Main navigation" className={cn(className, "flex flex-col gap-4")}>
			<ul className="ml-0 flex flex-col gap-2">
				<li onMouseEnter={(event) => handleMouseEnter(event)}>
					<Button
						ariaLabel="New Project"
						className="w-full gap-1.5 p-0.5 pl-1 hover:bg-green-200 disabled:opacity-100"
						disabled={isCreatingProject}
						onClick={handleCreateProject}
						title="New Project"
					>
						<div className="flex size-9 items-center justify-center">
							{isCreatingProject ? (
								<div className="pointer-events-none flex">
									<Loader className="ml-1 before:size-3 after:size-3" isCenter />
								</div>
							) : (
								<IconSvg alt="New Project" size="xl" src={NewProject} />
							)}
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

				<li
					className="group static"
					onMouseEnter={(event) => handleMouseEnter(event, sortedProjectsList)}
					onMouseLeave={onMouseLeave}
				>
					<div className="cursor-pointer before:absolute before:left-0 before:h-10 before:w-full" />

					<Button ariaLabel={t("myProjects")} className={buttonMenuStyle("#")} title={t("myProjects")}>
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
