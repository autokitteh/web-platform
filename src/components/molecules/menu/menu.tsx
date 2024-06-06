import React, { useEffect, useState } from "react";
import { NewProject } from "@assets/image";
import { Button, IconSvg, Toast } from "@components/atoms";
import { menuItems, fetchProjectsMenuItemsInterval } from "@constants";
import { SidebarMenu } from "@enums/components";
import { SidebarHrefMenu } from "@enums/components";
import { MenuProps, SubmenuInfo } from "@interfaces/components";
import { MenuItem } from "@interfaces/components";
import { ProjectsService } from "@services";
import { useProjectStore } from "@store";
import { cn } from "@utilities";
import { AnimatePresence, motion } from "framer-motion";
import { isEqual, orderBy } from "lodash";
import randomatic from "randomatic";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";

export const Menu = ({ className, isOpen = false, onSubmenu }: MenuProps) => {
	const { t } = useTranslation(["menu", "errors"]);
	const navigate = useNavigate();
	const location = useLocation();
	const { list, getProjectMenutItems } = useProjectStore();
	const [menu, setMenu] = useState<MenuItem[]>(menuItems);
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});

	const animateVariant = {
		hidden: { opacity: 0, width: 0 },
		visible: { opacity: 1, width: "auto", transition: { duration: 0.35, ease: "easeOut" } },
	};

	const createProject = async () => {
		const projectName = randomatic("Aa", 8);

		const { data: projectId, error } = await ProjectsService.create(projectName);

		if (error) {
			setToast({ isOpen: true, message: (error as Error).message });
			return;
		}

		navigate(`/${SidebarHrefMenu.projects}/${projectId}`);

		await getProjectMenutItems();
	};

	useEffect(() => {
		const projectsMenuItemsFetchIntervalId = setInterval(getProjectMenutItems, fetchProjectsMenuItemsInterval);
		return () => clearInterval(projectsMenuItemsFetchIntervalId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const sortedList = orderBy(list, "name", "asc");

		const currentSubmenu = menu.find(({ id }) => id === SidebarMenu.myProjects)?.submenu;
		if (isEqual(currentSubmenu, sortedList)) return;

		const updatedMenuItems = menuItems.map((item) =>
			item.id === SidebarMenu.myProjects ? { ...item, submenu: sortedList } : item
		);

		setMenu(updatedMenuItems);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [list]);

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
		<>
			<div className={cn(className, "flex flex-col gap-4")}>
				<div onMouseEnter={(e) => handleMouseEnter(e)}>
					<Button ariaLabel="New Project" className="hover:bg-green-light gap-1.5 p-0.5 pl-1" onClick={createProject}>
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
				</div>
				{menu.map(({ icon, name, href, submenu, id }) => (
					<div key={id} onMouseEnter={(e) => handleMouseEnter(e, submenu)}>
						<Button ariaLabel={name} className={buttonMenuStyle(href)} href={href}>
							<div className={buttonMenuIconWrapperStyle(href)}>
								<IconSvg alt={name} className={buttonMenuIconStyle(href)} src={icon} />
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
										{name}
									</motion.span>
								) : null}
							</AnimatePresence>
						</Button>
					</div>
				))}
			</div>
			<Toast
				duration={5}
				isOpen={toast.isOpen}
				onClose={() => setToast({ ...toast, isOpen: false })}
				title={t("error", { ns: "errors" })}
				type="error"
			>
				<p className="mt-1 text-xs">{toast.message}</p>
			</Toast>
		</>
	);
};
