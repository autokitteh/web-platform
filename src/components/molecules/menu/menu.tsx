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

import { Button, IconSvg } from "@components/atoms";

import { Plus, ProjectsIcon } from "@assets/image";

export const Menu = ({ className, isOpen = false, onMouseLeave, onSubmenu }: MenuProps) => {
	const { t } = useTranslation(["menu", "errors"]);
	const navigate = useNavigate();
	const location = useLocation();
	const { createProject, getProjectsList, projectsList } = useProjectStore();
	const addToast = useToastStore((state) => state.addToast);
	const [sortedProjectsList, setSortedProjectsList] = useState<Project[]>([]);

	useEffect(() => {
		const sortedProjects = projectsList.slice().sort((a, b) => a.name.localeCompare(b.name));
		setSortedProjectsList(sortedProjects);
	}, [projectsList]);

	const animateVariant = {
		hidden: { opacity: 0, width: 0 },
		visible: { opacity: 1, transition: { duration: 0.35, ease: "easeOut" }, width: "auto" },
	};

	const handleCreateProject = async () => {
		const { data, error } = await createProject(true);

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

	const buttonMenuIconWrapperStyle = (href: string) =>
		cn("flex h-9 w-9 items-center justify-center rounded-full duration-500", {
			"bg-gray-1100 hover:bg-gray-1100": isButtonActive(href) && !isOpen,
		});

	const buttonMenuStyle = (href: string) =>
		cn(
			"relative z-10 w-full gap-2.5 p-0.5 pl-2 text-gray-1100 group-hover:bg-green-200 justify-start rounded-full",
			{
				"bg-gray-1100": isButtonActive(href) && isOpen,
				"text-white hover:bg-gray-1100": isButtonActive(href),
			}
		);

	const buttonMenuIconStyle = (href: string) =>
		cn("size-7 transition", {
			"fill-white": isButtonActive(href),
			"fill-gray-1100": !isButtonActive(href),
		});

	return (
		<nav aria-label="Main navigation" className={cn(className, "flex flex-col gap-4")}>
			<ul className="ml-0 flex flex-col justify-start gap-2">
				<li onMouseEnter={(event) => handleMouseEnter(event)}>
					<Button
						ariaLabel="New Project"
						className="relative z-10 ml-0.5 w-full min-w-[40px] justify-start gap-2.5 rounded-full p-0.5 pl-2 text-gray-1100 hover:bg-green-200"
						onClick={handleCreateProject}
						title="New Project"
					>
						<div className="flex size-8 items-center justify-center">
							<IconSvg alt="New Project" size="xl" src={Plus} />
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
									<span className="ml-0.5">{t("newProject")}</span>
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
					<Button
						ariaLabel={t("myProjects")}
						className={cn(buttonMenuStyle("#"), "min-w-[40px]")}
						title={t("myProjects")}
					>
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
