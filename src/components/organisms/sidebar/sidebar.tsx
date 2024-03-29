import React, { useState } from "react";
import { DefaultAvatar, IconLogo, IconLogoName, IconNotification } from "@assets/image";
import { Icon, Badge, Button } from "@components/atoms";
import { Submenu, Menu } from "@components/molecules/menu";
import { ISubmenuInfo } from "@interfaces/components";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";

export const Sidebar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [submenuInfo, setSubmenuInfo] = useState<ISubmenuInfo>({ submenu: undefined, top: 0 });

	const handleMouseLeave = () => {
		setIsOpen(false);
		setSubmenuInfo({ submenu: undefined, top: 0 });
	};

	const animateVariant = {
		hidden: { opacity: 0, width: 0 },
		visible: { opacity: 1, width: "auto", transition: { duration: 0.35, ease: "easeOut" } },
	};

	return (
		<div className="w-sidebar relative">
			<div
				className="absolute flex items-start h-full top-0 left-0 z-50"
				onMouseEnter={() => setIsOpen(true)}
				onMouseLeave={handleMouseLeave}
			>
				<div className="h-full p-4 pt-6 pb-10 flex flex-col justify-between bg-white z-10">
					<div>
						<Link className="flex items-center gap-2.5 ml-1" to="/">
							<IconLogo className="w-8 h-8" />
							<AnimatePresence>
								{isOpen ? (
									<motion.span
										animate="visible"
										className="whitespace-nowrap overflow-hidden"
										exit="hidden"
										initial="hidden"
										variants={animateVariant}
									>
										<IconLogoName className="w-20 h-3" />
									</motion.span>
								) : null}
							</AnimatePresence>
						</Link>
						<Menu className="mt-8" isOpen={isOpen} onSubmenu={setSubmenuInfo} />
					</div>
					<div className="flex flex-col gap-5">
						<Button className="hover:bg-transparent" href="#">
							<div className="w-8 h-8 p-1 relative">
								<IconNotification />
								<Badge className="absolute top-0 right-0">2</Badge>
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
										Notifications
									</motion.span>
								) : null}
							</AnimatePresence>
						</Button>
						<Button className="hover:bg-transparent" href="#">
							<Icon alt="Notifications" className="w-9 h-9" src={DefaultAvatar} />
							<AnimatePresence>
								{isOpen ? (
									<motion.span
										animate="visible"
										className="whitespace-nowrap overflow-hidden"
										exit="hidden"
										initial="hidden"
										variants={animateVariant}
									>
										James L.
									</motion.span>
								) : null}
							</AnimatePresence>
						</Button>
					</div>
				</div>
				<AnimatePresence>
					{submenuInfo.submenu && submenuInfo.submenu.length > 0 ? <Submenu submenuInfo={submenuInfo} /> : null}
				</AnimatePresence>
			</div>
		</div>
	);
};
