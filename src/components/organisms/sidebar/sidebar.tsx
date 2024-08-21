import React, { Suspense, useEffect, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import { isAuthEnabled } from "@constants";
import { SubmenuInfo } from "@interfaces/components";

import { useUserStore } from "@store";

import { Button, Loader } from "@components/atoms";
import { Menu, Submenu } from "@components/molecules/menu";

import { IconLogo, IconLogoName } from "@assets/image";
import { LogoutIcon, SettingsIcon } from "@assets/image/sidebar";

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
		visible: { opacity: 1, transition: { duration: 0.35, ease: "easeOut" }, width: "auto" },
	};

	return (
		<Suspense fallback={<Loader isCenter size="lg" />}>
			<div className="relative w-main-nav-sidebar">
				<div
					className="absolute left-0 top-0 z-50 flex h-full items-start"
					onMouseEnter={() => setIsOpen(true)}
					onMouseLeave={handleMouseLeave}
				>
					<div className="z-10 flex h-full flex-col justify-between bg-white p-4 pb-10 pt-6">
						<div>
							<Link className="ml-1 flex items-center gap-2.5" to="/">
								<IconLogo className="h-8 w-8" />

								<AnimatePresence>
									{isOpen ? (
										<motion.span
											animate="visible"
											className="overflow-hidden whitespace-nowrap"
											exit="hidden"
											initial="hidden"
											variants={animateVariant}
										>
											<IconLogoName className="h-3 w-20" />
										</motion.span>
									) : null}
								</AnimatePresence>
							</Link>

							<Menu className="mt-8" isOpen={isOpen} onSubmenu={setSubmenuInfo} />
						</div>

						{isAuthEnabled ? (
							<div className="flex flex-col justify-end gap-5">
								<div>
									<Button className="hover:bg-transparent" href="/settings">
										<SettingsIcon className="h-7 w-7" fill="black" />

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
										<LogoutIcon className="h-7 w-7" fill="black" />

										<AnimatePresence>
											{isOpen ? (
												<motion.span
													animate="visible"
													exit="hidden"
													initial="hidden"
													variants={animateVariant}
												>
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
						{submenuInfo.submenu && !!submenuInfo.submenu.length ? (
							<Submenu submenuInfo={submenuInfo} />
						) : null}
					</AnimatePresence>
				</div>
			</div>
		</Suspense>
	);
};
