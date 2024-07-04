import React, { useEffect, useState, Suspense } from "react";
import { IconLogo, IconLogoName } from "@assets/image";
import { LogoutIcon, SettingsIcon } from "@assets/image/sidebar";
import { Button, Loader } from "@components/atoms";
import { Submenu, Menu } from "@components/molecules/menu";
import { isAuthEnabled } from "@constants";
import { SubmenuInfo } from "@interfaces/components";
import { useUserStore } from "@store";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

export const Sidebar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [submenuInfo, setSubmenuInfo] = useState<SubmenuInfo>({ submenu: undefined, top: 0 });
	const { logoutFunction } = useUserStore();
	const location = useLocation();
	const { t } = useTranslation("sidebar", { keyPrefix: "menu" });

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
		<Suspense fallback={<Loader isCenter size="lg" />}>
			<div className="relative w-main-nav-sidebar">
				<div
					className="absolute top-0 left-0 z-50 flex items-start h-full"
					onMouseEnter={() => setIsOpen(true)}
					onMouseLeave={handleMouseLeave}
				>
					<div className="z-10 flex flex-col justify-between h-full p-4 pt-6 pb-10 bg-white">
						<div>
							<Link className="flex items-center gap-2.5 ml-1" to="/">
								<IconLogo className="w-8 h-8" />
								<AnimatePresence>
									{isOpen ? (
										<motion.span
											animate="visible"
											className="overflow-hidden whitespace-nowrap"
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
						{isAuthEnabled ? (
							<div className="flex flex-col justify-end gap-5">
								<Button className="hover:bg-transparent" href="#">
									<img alt="avatar" className="w-8 h-8 rounded-full" src="https://via.placeholder.com/30" />
									<AnimatePresence>
										{isOpen ? (
											<motion.span
												animate="visible"
												className="overflow-hidden whitespace-nowrap"
												exit="hidden"
												initial="hidden"
												variants={animateVariant}
											>
												James L.
											</motion.span>
										) : null}
									</AnimatePresence>
								</Button>
								<div>
									<Button className="hover:bg-transparent" href="/settings">
										<SettingsIcon className="w-8 h-8" fill="black" />
										<AnimatePresence>
											{isOpen ? (
												<motion.span
													animate="visible"
													className="overflow-hidden whitespace-nowrap"
													exit="hidden"
													initial="hidden"
													variants={animateVariant}
												>
													{t("settings")}
												</motion.span>
											) : null}
										</AnimatePresence>
									</Button>
									<Button className="hover:bg-transparent" onClick={() => logoutFunction()}>
										<LogoutIcon className="w-8 h-8" fill="black" />
										<AnimatePresence>
											{isOpen ? (
												<motion.span animate="visible" exit="hidden" initial="hidden" variants={animateVariant}>
													{t("logout")}
												</motion.span>
											) : null}
										</AnimatePresence>
									</Button>
								</div>
							</div>
						) : null}
					</div>
					<AnimatePresence>
						{submenuInfo.submenu && submenuInfo.submenu.length > 0 ? <Submenu submenuInfo={submenuInfo} /> : null}
					</AnimatePresence>
				</div>
			</div>
		</Suspense>
	);
};
