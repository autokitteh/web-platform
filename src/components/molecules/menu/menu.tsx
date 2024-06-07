import React, { useEffect, useState } from "react";
import { NewProject } from "@assets/image";
import { Button, IconSvg } from "@components/atoms";
import { menuItems } from "@constants";
import { SidebarMenu } from "@enums/components";
import { SidebarHrefMenu } from "@enums/components";
import { MenuProps, SubmenuInfo } from "@interfaces/components";
import { MenuItem } from "@interfaces/components";
import { useProjectStore, useToastStore } from "@store";
import { cn } from "@utilities";
import { AnimatePresence, motion } from "framer-motion";
import { isEqual, orderBy } from "lodash";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";

export const Menu = ({ className, isOpen = false, onSubmenu }: MenuProps) => {
	const { t } = useTranslation(["menu", "errors"]);
	const navigate = useNavigate();
	const location = useLocation();
	const { list, createProject, addProjectToMenu } = useProjectStore();
	const [menu, setMenu] = useState<MenuItem[]>(menuItems);
	const addToast = useToastStore((state) => state.addToast);

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
				title: t("error"),
			});
			return;
		}

		if (!data) {
			addToast({
				id: Date.now().toString(),
				message: t("errors:projectNotCreated"),
				type: "error",
				title: t("error"),
			});
			return;
		}

		const { id, name } = data;
		const newProject = {
			id,
			name,
			href: `/${SidebarHrefMenu.projects}/${id}`,
		};

		addProjectToMenu(newProject);

		navigate(`/${SidebarHrefMenu.projects}/${id}`);
	};

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
		<div className={cn(className, "flex flex-col gap-4")}>
			<div onMouseEnter={(e) => handleMouseEnter(e)}>
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
	);
};
