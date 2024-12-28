import React, { Suspense, useEffect, useState } from "react";

import { AnimatePresence, motion } from "motion/react";
import Avatar from "react-avatar";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import { UserFeedbackForm } from "../userFeedbackForm";
import { featureFlags, isAuthEnabled, userMenuItems } from "@constants";
import { cn } from "@src/utilities";

import { useLoggerStore, useUserStore } from "@store";

import { Badge, Button, IconSvg, Loader } from "@components/atoms";
import { MenuToggle } from "@components/atoms/menuToggle";
import { PopoverTrigger } from "@components/molecules";
import { Menu } from "@components/molecules/menu";
import { Popover, PopoverContent } from "@components/molecules/popover/index";
import { NewProjectModal } from "@components/organisms";
import { UserMenu } from "@components/organisms/sidebar";

import { IconLogo, IconLogoName } from "@assets/image";
import { AnnouncementIcon, CircleQuestionIcon, EventListIcon, FileIcon, LogoutIcon } from "@assets/image/icons/sidebar";

export const Sidebar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const { logoutFunction, user } = useUserStore();
	const { isLoggerEnabled, isNewLogs, toggleLogger } = useLoggerStore();
	const location = useLocation();
	const { t } = useTranslation("sidebar");

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
						<div className="flex gap-1.5">
							<Link className="ml-1 flex justify-start gap-2.5" to="/">
								<IconLogo className="size-8" />
							</Link>
							<Link className="flex items-center gap-2.5" to="/">
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
						</div>
						<Button
							ariaLabel={isOpen ? t("closeSidebar") : t("openSidebar")}
							className="mt-7 w-full justify-center gap-2.5 p-0.5 pr-2 hover:bg-green-200"
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

					<div className="flex flex-col gap-2">
						<Button
							ariaLabel={t("events")}
							className="p-0 hover:bg-green-200"
							href="/events"
							title={t("events")}
						>
							<div className="flex size-10 items-center justify-center">
								<IconSvg className="size-5 transition" src={EventListIcon} />
							</div>

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
							className="p-0 hover:bg-green-200"
							onClick={() => toggleLogger(!isLoggerEnabled)}
							title={t("systemLog")}
						>
							<div className="flex size-10 items-center justify-center">
								<Badge
									anchorOrigin={{ vertical: "top", horizontal: "left" }}
									ariaLabel={t("logToReview")}
									className="absolute"
									isVisible={isNewLogs}
									variant="dot"
								>
									<IconSvg className="size-5.5 stroke-gray-1100 transition" src={FileIcon} />
								</Badge>
							</div>

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

						<Button className="p-0 hover:bg-green-200" href="/intro" title={t("intro")}>
							<div className="flex size-10 items-center justify-center">
								<IconSvg className="size-5.5 transition" src={CircleQuestionIcon} />
							</div>

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
								<PopoverTrigger className="ml-2 mt-2 flex items-center">
									<Avatar color="black" name={user?.name} round={true} size="24" />
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
									{featureFlags.enableNewOrgsAndUsersDesign ? (
										<UserMenu />
									) : (
										<>
											<div className="flex items-center gap-2 border-b border-b-gray-950 pb-2 pl-2">
												<Avatar color="black" name={`${user?.name}`} round={true} size="28" />
												<span className="font-medium text-black">{user?.email}</span>
											</div>
											<div className="mt-1">
												<Button className="w-full rounded-md px-2.5 text-lg hover:bg-gray-250">
													<AnnouncementIcon className="size-6" fill="black" />
													{t("menu.userSettings.feedback")}
												</Button>
												{userMenuItems.map(({ href, icon, label, stroke }, index) => (
													<Button
														className="w-full rounded-md px-2.5 text-lg hover:bg-gray-250"
														href={href}
														key={index}
														title={t("userSettings.settings")}
													>
														<IconSvg
															className={cn({
																"fill-black": !stroke,
																"stroke-black": stroke,
															})}
															size="lg"
															src={icon}
														/>
														{t(label)}
													</Button>
												))}
												<Button
													className="w-full rounded-md px-2.5 text-lg hover:bg-gray-250"
													onClick={() => logoutFunction()}
												>
													<LogoutIcon className="size-5" fill="black" />
													{t("menu.userSettings.logout")}
												</Button>
											</div>
										</>
									)}
								</PopoverContent>
							</Popover>
						) : null}
					</div>
					<div className="absolute bottom-0 left-20">
						<UserFeedbackForm />
					</div>
				</div>
			</div>
			<NewProjectModal />
		</Suspense>
	);
};
