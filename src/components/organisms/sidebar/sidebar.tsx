import React, { Suspense, useEffect, useState } from "react";

import { AnimatePresence, motion } from "motion/react";
import Avatar from "react-avatar";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import { isAuthEnabled } from "@constants";

import { useLoggerStore, useUserStore } from "@store";

import { Badge, Button, IconSvg, Loader } from "@components/atoms";
import { MenuToggle } from "@components/atoms/menuToggle";
import { PopoverTrigger } from "@components/molecules";
import { Menu } from "@components/molecules/menu";
import { Popover, PopoverContent } from "@components/molecules/popover/index";
import { NewProjectModal } from "@components/organisms";

import { IconLogo, IconLogoName } from "@assets/image";
import { CircleQuestionIcon, FlagIcon, LogoutIcon, NoteIcon, SettingsIcon } from "@assets/image/sidebar";

export const Sidebar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const { logoutFunction, user } = useUserStore();
	const { isLoggerEnabled, isNewLogs, toggleLogger } = useLoggerStore();
	const location = useLocation();
	const { t } = useTranslation("sidebar", { keyPrefix: "menu" });

	useEffect(() => {
		setIsOpen(false);
	}, [location.pathname]);

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

						<Menu className="mt-5" isOpen={isOpen} />
					</div>

					<div className="flex flex-col gap-5">
						<Button
							ariaLabel={t("events")}
							className="hover:bg-green-200"
							href="/events"
							title={t("events")}
						>
							<IconSvg className="size-7 transition" src={FlagIcon} />

							<AnimatePresence>
								{isOpen ? (
									<motion.span
										animate="visible"
										className="overflow-hidden whitespace-nowrap"
										exit="hidden"
										initial="hidden"
										variants={animateVariant}
									>
										{t("events")}
									</motion.span>
								) : null}
							</AnimatePresence>
						</Button>

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
								<IconSvg className="size-7 transition" src={NoteIcon} />
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
							<IconSvg className="size-7 transition" src={CircleQuestionIcon} />

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
							<Popover interactionType="click" placement="right-start">
								<PopoverTrigger className="ml-1.5 flex items-center">
									<Avatar color="black" name={user?.name} round={true} size="32" />
									<AnimatePresence>
										{isOpen ? (
											<motion.span
												animate="visible"
												className="ml-2.5 overflow-hidden whitespace-nowrap text-black"
												exit="hidden"
												initial="hidden"
												variants={animateVariant}
											>
												{user?.name}
											</motion.span>
										) : null}
									</AnimatePresence>
								</PopoverTrigger>
								<PopoverContent className="z-50 min-w-56 rounded-2xl border border-gray-950 bg-white px-3.5 py-2.5 font-averta shadow-2xl">
									<div className="flex items-center gap-2 border-b border-b-gray-950 pb-2 pl-2">
										<Avatar color="black" name={`${user?.name}`} round={true} size="32" />
										<span className="font-medium text-black">{user?.email}</span>
									</div>
									<div className="mt-1">
										<Button
											className="w-full rounded-md px-2.5 text-lg hover:bg-gray-250"
											href="/settings"
											title={t("settings")}
										>
											<SettingsIcon className="size-5" fill="black" />
											{t("settings")}
										</Button>
										<Button
											className="w-full rounded-md px-2.5 text-lg hover:bg-gray-250"
											onClick={() => logoutFunction()}
										>
											<LogoutIcon className="size-5" fill="black" />
											{t("logout")}
										</Button>
									</div>
								</PopoverContent>
							</Popover>
						) : null}
					</div>
				</div>
			</div>
			<NewProjectModal />
		</Suspense>
	);
};
