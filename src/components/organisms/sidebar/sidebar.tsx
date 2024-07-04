import { IconLogo, IconLogoName } from "@assets/image";
import { LogoutIcon, SettingsIcon } from "@assets/image/sidebar";
import { Button, Loader } from "@components/atoms";
import { Menu, Submenu } from "@components/molecules/menu";
import { isAuthEnabled } from "@constants";
import { SubmenuInfo } from "@interfaces/components";
import { useUserStore } from "@store";
import { AnimatePresence, motion } from "framer-motion";
import React, { Suspense, useEffect, useState } from "react";
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
		visible: { opacity: 1, transition: { duration: 0.35, ease: "easeOut" }, width: "auto" },
	};

	return (
		<Suspense fallback={<Loader size="lg" />}>
			<div className="relative w-main-nav-sidebar">
				<div
					className="absolute flex h-full items-start left-0 top-0 z-50"
					onMouseEnter={() => setIsOpen(true)}
					onMouseLeave={handleMouseLeave}
				>
					<div className="bg-white flex flex-col h-full justify-between p-4 pb-10 pt-6 z-10">
						<div>
							<Link className="flex gap-2.5 items-center ml-1" to="/">
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
							<div className="flex flex-col gap-5 justify-end">
								<Button className="hover:bg-transparent" href="#">
									<img alt="avatar" className="h-8 rounded-full w-8" src="https://via.placeholder.com/30" />

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
										<SettingsIcon className="h-8 w-8" fill="black" />

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
										<LogoutIcon className="h-8 w-8" fill="black" />

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
						{submenuInfo.submenu && !!submenuInfo.submenu.length ? <Submenu submenuInfo={submenuInfo} /> : null}
					</AnimatePresence>
				</div>
			</div>
		</Suspense>
	);
};
