import React, { useEffect } from "react";
import { NewProject, ProjectsIcon } from "@assets/image";
import { Button, IconSvg } from "@components/atoms";
import { SidebarHrefMenu } from "@enums/components";
import { MenuProps, SubmenuInfo } from "@interfaces/components";
import { useProjectStore, useToastStore } from "@store";
import { ProjectMenuItem } from "@type/models";
import { cn } from "@utilities";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";

export const Menu = ({ className, isOpen = false, onSubmenu }: MenuProps) => {
	const { t } = useTranslation(["menu", "errors"]);
	const navigate = useNavigate();
	const location = useLocation();
	const { menuList: projectsMenuList, createProject, addProjectToMenu, getProjectMenutItems } = useProjectStore();
	const addToast = useToastStore((state) => state.addToast);
	const [sortedProjectsList, setSortedProjectsList] = React.useState<ProjectMenuItem[]>();

	useEffect(() => {
		if (projectsMenuList.length) {
			const sortedProjects = projectsMenuList.slice().sort((a, b) => a.name.localeCompare(b.name));
			setSortedProjectsList(sortedProjects);
		}
	}, [projectsMenuList]);

	const animateVariant = {
		hidden: { opacity: 0, width: 0 },
		visible: { opacity: 1, width: "auto", transition: { duration: 0.35, ease: "easeOut" } },
	};

	const handleCreateProject = async () => {
		const { data, error } = await createProject();

		if (error) {
			addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
				title: t("error", { ns: "errors" }),
			});
			return;
		}

		const menuProject = {
			id: data!.projectId,
			name: data!.name,
			href: `/${SidebarHrefMenu.projects}/${data?.projectId}`,
		};

		addProjectToMenu(menuProject);

		navigate(`/${SidebarHrefMenu.projects}/${data?.projectId}`);
	};

	useEffect(() => {
		getProjectMenutItems();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleMouseEnter = (e: React.MouseEvent, submenu?: SubmenuInfo["submenu"]) => {
		onSubmenu?.({ submenu, top: e.currentTarget.getBoundingClientRect().top + 5 });
	};

	const isButtonActive = (href: string) => location.pathname.startsWith(href);

	const buttonMenuStyle = (href: string) =>
		cn("hover:bg-green-light gap-1.5 p-0.5 pl-1", {
			"hover:bg-gray-700 text-white": isButtonActive(href),
			"bg-gray-700": isButtonActive(href) && isOpen,
		});

	const buttonMenuIconStyle = (href: string) =>
		cn("fill-gray-700", {
			"fill-white p-0.5": isButtonActive(href),
		});

	const buttonMenuIconWrapperStyle = (href: string) =>
		cn("w-9 h-9 flex items-center justify-center rounded-full duration-500", {
			"bg-gray-700 hover:bg-gray-700": isButtonActive(href) && !isOpen,
		});

	return (
		<nav aria-label="Main navigation" className={cn(className, "flex flex-col gap-4")}>
			<ul>
				<li onMouseEnter={(e) => handleMouseEnter(e)}>
					<Button
						ariaLabel="New Project"
						className="hover:bg-green-light gap-1.5 p-0.5 pl-1"
						onClick={handleCreateProject}
					>
						<div className="flex items-center justify-center w-9 h-9">
							<IconSvg alt="New Project" className="w-8 h-8 p-1" src={NewProject} />
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
				<li onMouseEnter={(e) => handleMouseEnter(e, sortedProjectsList || [])}>
					<Button ariaLabel="My Projects" className={buttonMenuStyle("#")} href="#">
						<div className={buttonMenuIconWrapperStyle("#")}>
							<IconSvg alt="My Projects" className={buttonMenuIconStyle("#")} src={ProjectsIcon} />
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
									My Projects
								</motion.span>
							) : null}
						</AnimatePresence>
					</Button>
				</li>
			</ul>
		</nav>
	);
};
