import React, { useEffect, useState } from "react";
import { NewProject } from "@assets/image";
import { Button, IconSvg, Toast, Input } from "@components/atoms";
import { Modal } from "@components/molecules";
import { menuItems } from "@constants";
import { IMenu, ISubmenuInfo } from "@interfaces/components";
import { IMenuItem } from "@interfaces/components";
import { ProjectsService } from "@services";
import { useMenuStore } from "@store";
import { cn } from "@utilities";
import { isEqual } from "lodash";

export const Menu = ({ className, isOpen = false, onSubmenu }: IMenu) => {
	const { lastMenuUpdate } = useMenuStore();
	const [menu, setMenu] = useState<IMenuItem[]>(menuItems);
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});
	const [isModal, setIsModal] = useState(false);

	useEffect(() => {
		const fetchMenu = async () => {
			const { data, error } = await ProjectsService.list();
			if (error) {
				setToast({ ...toast, message: (error as Error)?.message || "Something wrong!" });
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

		const intervalMenu = setInterval(fetchMenu, 60000);
		return () => clearInterval(intervalMenu);
	}, [lastMenuUpdate]);

	const handleMouseEnter = (submenu: ISubmenuInfo["submenu"], e: React.MouseEvent) => {
		onSubmenu?.({ submenu: submenu || undefined, top: e.currentTarget.getBoundingClientRect().top + 5 });
	};
	const handleCloseToast = () => setToast({ ...toast, isOpen: false });
	const toggleModal = () => setIsModal(!isModal);

	return (
		<>
			<div className={cn(className, "flex flex-col gap-4")}>
				<div onMouseEnter={(e) => handleMouseEnter(undefined, e)}>
					<Button className="hover:bg-green-light" onClick={toggleModal}>
						<IconSvg alt="New Project" className="w-8 h-8 p-1 " src={NewProject} />
						{isOpen ? "New Project" : null}
					</Button>
				</div>
				{menu.map(({ icon, name, href, submenu, id }) => (
					<div key={id} onMouseEnter={(e) => handleMouseEnter(submenu, e)}>
						<Button className="hover:bg-green-light" href={href}>
							{icon ? <IconSvg alt={name} className="w-8 h-8 p-1 " src={icon} /> : null}
							{isOpen ? name : null}
						</Button>
					</div>
				))}
			</div>
			<Modal isOpen={isModal} onClose={toggleModal}>
				<div className="mx-6">
					<h3 className="text-xl font-bold mb-5">Add New</h3>
					<form>
						<Input
							classInput="placeholder:text-gray-400 hover:placeholder:text-gray-800"
							className="bg-white border-gray-400 hover:border-gray-700"
							isRequired
							placeholder="Name"
						/>
						<Button className="font-bold justify-center mt-2 rounded-lg py-2.5" variant="filled">
							Create
						</Button>
					</form>
				</div>
			</Modal>
			<Toast className="border-error" duration={10} isOpen={toast.isOpen} onClose={handleCloseToast}>
				<h5 className="font-semibold">Error</h5>
				<p className="mt-1 text-xs">{toast.message}</p>
			</Toast>
		</>
	);
};
