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
import { isEqual, orderBy } from "lodash";
import { useNavigate } from "react-router-dom";

export const Menu = ({ className, isOpen = false, onSubmenu }: IMenu) => {
	const navigate = useNavigate();
	const { list, getProjectsList } = useProjectStore();
	const [menu, setMenu] = useState<IMenuItem[]>(menuItems);
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});

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
	const handleCloseToast = () => setToast({ ...toast, isOpen: false });

	return (
		<>
			<div className={cn(className, "flex flex-col gap-4")}>
				<div onMouseEnter={(e) => handleMouseEnter(e)}>
					<Button ariaLabel="New Project" className="hover:bg-green-light gap-1.5 p-0.5 pl-1" onClick={createProject}>
						<div className="w-9 h-9 flex items-center justify-center">
							<IconSvg alt="New Project" className="w-8 h-8 p-1" src={NewProject} />
						</div>
						{isOpen ? "New Project" : null}
					</Button>
				</div>
				{menu.map(({ icon, name, href, submenu, id }) => (
					<div key={id} onMouseEnter={(e) => handleMouseEnter(e, submenu)}>
						<Button ariaLabel={name} className="hover:bg-green-light gap-1.5 p-0.5 pl-1" href={href}>
							{icon ? (
								<div className="w-9 h-9 flex items-center justify-center">
									<IconSvg alt={name} src={icon} />
								</div>
							) : null}
							{isOpen ? name : null}
						</Button>
					</div>
				))}
			</div>
			<Toast className="border-error" duration={5} isOpen={toast.isOpen} onClose={handleCloseToast}>
				<h5 className="font-semibold text-error">Error</h5>
				<p className="mt-1 text-xs">{toast.message}</p>
			</Toast>
		</>
	);
};
