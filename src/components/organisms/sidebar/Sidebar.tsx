import React, { useState } from "react";
import { Link } from "react-router-dom";

import { Icon, Badge, Button } from "@components/atoms";
import { ISubmenuInfo, Submenu, Menu } from "@components/molecules/menu";

import IconLogo from "@assets/Logo.svg";
import IconLogoName from "@assets/LogoName.svg";
import IconNotification from "@assets/sidebar/Notification.svg";
import PictureAvatar from "@assets/avatar.png";

export const Sidebar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [submenuInfo, setSubmenuInfo] = useState<ISubmenuInfo>({ submenu: null, top: 0 });

	const handleMouseEnter = () => setIsOpen(true);

	const handleMouseLeave = () => {
		setIsOpen(false);
		setSubmenuInfo({ submenu: null, top: 0 });
	};

	return (
		<div
			className="flex items-start"
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			<div className="h-full p-4 pt-6 pb-10 flex flex-col justify-between bg-white z-10">
				<div>
					<div className="flex items-center gap-2.5 ml-1">
						<Icon alt="logo" src={IconLogo} />
						<Icon alt="autokitteh" className="w-20 h-3" isVisible={isOpen} src={IconLogoName} />
					</div>
					<Menu className="mt-8" isOpen={isOpen} onSubmenu={setSubmenuInfo} />
				</div>
				<div className="grid gap-5">
					<Link to="#">
						<Button variant="transparent">
							<div className="w-8 h-8 p-1 relative">
								<Icon alt="Notifications" src={IconNotification} />
								<Badge className="absolute top-0 right-0" text="2" />
							</div>
							{isOpen ? "Notifications" : null}
						</Button>
					</Link>
					<Link to="#">
						<Button variant="transparent">
							<Icon alt="Notifications" className="w-9 h-9" src={PictureAvatar} />
							{isOpen ? "James L." : null}
						</Button>
					</Link>
				</div>
			</div>
			{submenuInfo.submenu ? <Submenu submenuInfo={submenuInfo} /> : null}
		</div>
	);
};
