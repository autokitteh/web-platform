import React, { Suspense, useEffect, useRef, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import { isAuthEnabled } from "@constants";
import { SubmenuInfo } from "@interfaces/components";

import { useLoggerStore, useUserStore } from "@store";

import { Badge, Button, IconSvg, Loader } from "@components/atoms";
import { MenuToggle } from "@components/atoms/menuToggle";
import { Menu, Submenu } from "@components/molecules/menu";

import { IconLogo, IconLogoName } from "@assets/image";
import { FileIcon, HelpIcon } from "@assets/image/icons";
import { LogoutIcon, SettingsIcon } from "@assets/image/sidebar";

export const Sidebar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [submenuInfo, setSubmenuInfo] = useState<SubmenuInfo>({ submenu: undefined, top: 0 });
	const { logoutFunction } = useUserStore();
	const { isLoggerEnabled, isNewLogs, toggleLogger } = useLoggerStore();
	const location = useLocation();
	const { t } = useTranslation("sidebar", { keyPrefix: "menu" });
	const submenuRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		setIsOpen(false);
	}, [location.pathname]);

	const handleMouseLeave = (event: React.MouseEvent) => {
		const relatedTarget = event.relatedTarget as Node | null;
		if (submenuRef.current && relatedTarget && submenuRef.current.contains(relatedTarget)) {
			return;
		}
		setSubmenuInfo({ submenu: undefined, top: 0 });
	};

	const animateVariant = {
		hidden: { opacity: 0, width: 0 },
		visible: { opacity: 1, transition: { duration: 0.35, ease: "easeOut" }, width: "auto" },
	};

	return (
		<Suspense fallback={<Loader isCenter size="lg" />}>
			<div className="relative z-40 flex h-full min-w-[65px] items-start">
				<div className="z-10 flex h-full flex-col justify-between bg-white p-2.5 pb-10 pt-6">
					<div>
						<Link className="ml-1 flex items-center gap-2.5" to="/">
							<IconLogo className="size-8" />

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

						<Button
							ariaLabel={isOpen ? t("closeSidebar") : t("openSidebar")}
							className="mt-10 w-full gap-2.5 p-0.5 pl-1 pr-2 hover:bg-green-200"
							onClick={() => setIsOpen(!isOpen)}
							title={isOpen ? t("closeSidebar") : t("openSidebar")}
						>
							<MenuToggle
								className="-mr-2 flex w-9 items-center justify-center pb-1 pt-2"
								isOpen={isOpen}
							/>

							<AnimatePresence>
								{isOpen ? (
									<motion.span
										animate="visible"
										className="overflow-hidden whitespace-nowrap"
										exit="hidden"
										initial="hidden"
										variants={animateVariant}
									>
										{t("closeSidebar")}
									</motion.span>
								) : null}
							</AnimatePresence>
						</Button>

						<Menu
							className="mt-8"
							isOpen={isOpen}
							onMouseLeave={handleMouseLeave}
							onSubmenu={setSubmenuInfo}
						/>
					</div>

					<div className="flex flex-col justify-end gap-5">
						<Button
							ariaLabel={t("systemLog")}
							className="hover:bg-green-200"
							onClick={() => toggleLogger(!isLoggerEnabled)}
							title={t("systemLog")}
						>
							<Badge
								anchorOrigin={{ vertical: "top", horizontal: "left" }}
								ariaLabel={t("logToReview")}
								className="absolute"
								isVisible={isNewLogs}
								variant="dot"
							>
								<IconSvg className="size-7 stroke-gray-1300 transition" src={FileIcon} />
							</Badge>

							<AnimatePresence>
								{isOpen ? (
									<motion.span
										animate="visible"
										className="overflow-hidden whitespace-nowrap"
										exit="hidden"
										initial="hidden"
										variants={animateVariant}
									>
										{t("systemLog")}
									</motion.span>
								) : null}
							</AnimatePresence>
						</Button>

						<Button className="hover:bg-green-200" href="/intro" title={t("intro")}>
							<IconSvg className="size-7 transition" src={HelpIcon} />

							<AnimatePresence>
								{isOpen ? (
									<motion.span
										animate="visible"
										className="overflow-hidden whitespace-nowrap"
										exit="hidden"
										initial="hidden"
										variants={animateVariant}
									>
										{t("intro")}
									</motion.span>
								) : null}
							</AnimatePresence>
						</Button>
						{isAuthEnabled ? (
							<div>
								<Button className="hover:bg-green-200" href="/settings" title={t("settings")}>
									<SettingsIcon className="size-7" fill="black" />

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

								<Button
									className="hover:bg-green-200"
									onClick={() => logoutFunction()}
									title={t("logout")}
								>
									<LogoutIcon className="size-7" fill="black" />

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
						) : null}
					</div>
				</div>

				<AnimatePresence>
					{submenuInfo.submenu && !!submenuInfo.submenu.length ? (
						<div onMouseLeave={handleMouseLeave} ref={submenuRef}>
							<Submenu submenuInfo={submenuInfo} />
						</div>
					) : null}
				</AnimatePresence>
			</div>
		</Suspense>
	);
};
