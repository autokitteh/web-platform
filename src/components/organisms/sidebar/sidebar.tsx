import React, { useEffect, useState, Suspense } from "react";
import { IconLogo, IconLogoName } from "@assets/image";
import { Submenu, Menu } from "@components/molecules/menu";
import { SubmenuInfo } from "@interfaces/components";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

export const Sidebar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [submenuInfo, setSubmenuInfo] = useState<SubmenuInfo>({ submenu: undefined, top: 0 });
	const location = useLocation();

	const handleMouseLeave = () => {
		setIsOpen(false);
		setSubmenuInfo({ submenu: undefined, top: 0 });
	};

	useEffect(() => {
		setIsOpen(false);
	}, [location.pathname]);

	const animateVariant = {
		hidden: { opacity: 0, width: 0 },
		visible: { opacity: 1, width: "auto", transition: { duration: 0.35, ease: "easeOut" } },
	};

	return (
		<Suspense fallback={<div>loading...</div>}>
			<div className="w-main-nav-sidebar relative">
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
					</div>
					<AnimatePresence>
						{submenuInfo.submenu && submenuInfo.submenu.length > 0 ? <Submenu submenuInfo={submenuInfo} /> : null}
					</AnimatePresence>
				</div>
			</div>
		</Suspense>
	);
};
