import React, { useEffect, useState } from "react";
import { NewProject } from "@assets/image";
import { Button, IconSvg, Toast } from "@components/atoms";
import { menuItems, fetchMenuInterval } from "@constants";
import { IMenu, ISubmenuInfo } from "@interfaces/components";
import { IMenuItem } from "@interfaces/components";
import { ProjectsService } from "@services";
import { useMenuStore } from "@store";
import { cn } from "@utilities";
import { isEqual } from "lodash";

export const Menu = ({ className, isOpen = false, onSubmenu }: IMenu) => {
	const { projectUpdateCount, updateProject } = useMenuStore();
	const [menu, setMenu] = useState<IMenuItem[]>(menuItems);
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});

	const createProject = async () => {
		const { data, error } = await ProjectsService.create("");

		if (error) {
			setToast({ isOpen: true, message: (error as Error).message });
			return;
		}
		if (data) updateProject(data);
	};

	useEffect(() => {
		const fetchMenu = async () => {
			const { data, error } = await ProjectsService.list();
			if (error) {
				setToast({ isOpen: true, message: (error as Error).message });
				return;
			}
			const updatedSubmenu = data?.map(({ projectId, name }) => ({
				id: projectId,
				name,
			}));
			const currentSubmenu = menu.find(({ id }) => id === 1)?.submenu;

			if (isEqual(currentSubmenu, updatedSubmenu)) return;
			setMenu(menuItems.map((item) => (item.id === 1 ? { ...item, submenu: updatedSubmenu } : item)));
		};

		fetchMenu();

		const intervalMenu = setInterval(fetchMenu, fetchMenuInterval);
		return () => clearInterval(intervalMenu);
	}, [projectUpdateCount]);

	const handleMouseEnter = (e: React.MouseEvent, submenu?: ISubmenuInfo["submenu"]) => {
		onSubmenu?.({ submenu, top: e.currentTarget.getBoundingClientRect().top + 5 });
	};
	const handleCloseToast = () => setToast({ ...toast, isOpen: false });

	return (
		<>
			<div className={cn(className, "flex flex-col gap-4")}>
				<div onMouseEnter={(e) => handleMouseEnter(e)}>
					<Button className="hover:bg-green-light" onClick={createProject}>
						<IconSvg alt="New Project" className="w-8 h-8 p-1 " src={NewProject} />
						{isOpen ? "New Project" : null}
					</Button>
				</div>
				{menu.map(({ icon, name, href, submenu, id }) => (
					<div key={id} onMouseEnter={(e) => handleMouseEnter(e, submenu)}>
						<Button className="hover:bg-green-light" href={href}>
							{icon ? <IconSvg alt={name} className="w-8 h-8 p-1 " src={icon} /> : null}
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
