import React, { useEffect, useLayoutEffect, useState } from "react";
import { NewProject } from "@assets/image";
import { Button, IconSvg, Toast } from "@components/atoms";
import { menuItems, fetchMenuInterval } from "@constants";
import { ESidebarMenu } from "@enums/components";
import { IMenu, ISubmenuInfo } from "@interfaces/components";
import { IMenuItem } from "@interfaces/components";
import { ProjectsService } from "@services";
import { useProjectStore } from "@store";
import { cn } from "@utilities";
import { AnimatePresence, motion } from "framer-motion";
import { isEqual, orderBy } from "lodash";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export const Menu = ({ className, isOpen = false, onSubmenu }: IMenu) => {
	const { t } = useTranslation(["menu", "errors"]);
	const navigate = useNavigate();
	const { list, getProjectsList } = useProjectStore();
	const [menu, setMenu] = useState<IMenuItem[]>(menuItems);
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});

	const animateVariant = {
		hidden: { opacity: 0, width: 0 },
		visible: { opacity: 1, width: "auto", transition: { duration: 0.35, ease: "easeOut" } },
	};

	const createProject = async () => {
		const { data: projectId, error } = await ProjectsService.create("");

		if (error) {
			setToast({ isOpen: true, message: (error as Error).message });
			return;
		}

		navigate(`/${projectId}`);

		await getProjectsList();
	};

	useLayoutEffect(() => {
		const fetchMenu = async () => await getProjectsList();
		fetchMenu();

		const intervalMenu = setInterval(fetchMenu, fetchMenuInterval);
		return () => clearInterval(intervalMenu);
	}, []);

	useEffect(() => {
		const sortedList = orderBy(list, "name", "asc");

		const currentSubmenu = menu.find(({ id }) => id === ESidebarMenu.myProjects)?.submenu;
		if (isEqual(currentSubmenu, sortedList)) return;

		const updatedMenuItems = menuItems.map((item) =>
			item.id === ESidebarMenu.myProjects ? { ...item, submenu: sortedList } : item
		);

		setMenu(updatedMenuItems);
	}, [list]);

	const handleMouseEnter = (e: React.MouseEvent, submenu?: ISubmenuInfo["submenu"]) => {
		onSubmenu?.({ submenu, top: e.currentTarget.getBoundingClientRect().top + 5 });
	};

	return (
		<>
			<div className={cn(className, "flex flex-col gap-4")}>
				<div onMouseEnter={(e) => handleMouseEnter(e)}>
					<Button ariaLabel="New Project" className="hover:bg-green-light gap-1.5 p-0.5 pl-1" onClick={createProject}>
						<div className="w-9 h-9 flex items-center justify-center">
							<IconSvg alt="New Project" className="w-8 h-8 p-1" src={NewProject} />
						</div>
						<AnimatePresence>
							{isOpen ? (
								<motion.span
									animate="visible"
									className="whitespace-nowrap overflow-hidden"
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
						<Button ariaLabel={name} className="hover:bg-green-light gap-1.5 p-0.5 pl-1" href={href}>
							<div className="w-9 h-9 flex items-center justify-center">
								<IconSvg alt={name} src={icon} />
							</div>
							<AnimatePresence>
								{isOpen ? (
									<motion.span
										animate="visible"
										className="whitespace-nowrap overflow-hidden"
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
				className="border-error"
				duration={5}
				isOpen={toast.isOpen}
				onClose={() => setToast({ ...toast, isOpen: false })}
			>
				<p className="font-semibold text-error">{t("error", { ns: "errors" })}</p>
				<p className="mt-1 text-xs">{toast.message}</p>
			</Toast>
		</>
	);
};
