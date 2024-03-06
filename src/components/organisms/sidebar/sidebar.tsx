import React, { useState, useEffect } from "react";
import { DefaultAvatar, IconLogo, IconLogoName, IconNotification } from "@assets/image";
import { Icon, Badge, Button } from "@components/atoms";
import { Submenu, Menu } from "@components/molecules/menu";
import { ISubmenuInfo } from "@interfaces/components";
import { useUiGlobalStore } from "@store";

export const Sidebar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [submenuInfo, setSubmenuInfo] = useState<ISubmenuInfo>({ submenu: undefined, top: 0 });
	const { refreshMenu } = useUiGlobalStore();
	const handleMouseEnter = () => setIsOpen(true);

	const handleMouseLeave = () => {
		setIsOpen(false);
		setSubmenuInfo({ submenu: undefined, top: 0 });
	};

	useEffect(() => {
		const loadMenu = async () => await refreshMenu();
		loadMenu();
	}, []);

	return (
		<div className="flex items-start" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
			<div className="h-full p-4 pt-6 pb-10 flex flex-col justify-between bg-white z-10">
				<div>
					<div className="flex items-center gap-2.5 ml-1">
						<IconLogo className="w-8 h-8" />
						{isOpen ? <IconLogoName className="w-20 h-3" /> : null}
					</div>
					<Menu className="mt-8" isOpen={isOpen} onSubmenu={setSubmenuInfo} />
				</div>
				<div className="flex flex-col gap-5">
					<Button className="hover:bg-transparent" href="#">
						<div className="w-8 h-8 p-1 relative">
							<IconNotification />
							<Badge className="absolute top-0 right-0">2</Badge>
						</div>
						{isOpen ? "Notifications" : null}
					</Button>
					<Button className="hover:bg-transparent" href="#">
						<Icon alt="Notifications" className="w-9 h-9" src={DefaultAvatar} />
						{isOpen ? "James L." : null}
					</Button>
				</div>
			</div>
			{submenuInfo.submenu ? <Submenu submenuInfo={submenuInfo} /> : null}
		</div>
	);
};
