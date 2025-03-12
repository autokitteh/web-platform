import React, { Suspense, useEffect, useState } from "react";

import { AnimatePresence, motion } from "motion/react";
import Avatar from "react-avatar";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import { descopeProjectId } from "@constants";
import { cn } from "@src/utilities";

import { useLoggerStore, useOrganizationStore, useToastStore } from "@store";

import { Badge, Button, IconSvg, Loader, Tooltip } from "@components/atoms";
import { MenuToggle } from "@components/atoms/menuToggle";
import { Menu } from "@components/molecules/menu";
import { PopoverWrapper, PopoverContent, PopoverTrigger } from "@components/molecules/popover";
import { NewProjectModal, UserFeedbackForm } from "@components/organisms";
import { UserMenu } from "@components/organisms/sidebar";

import { IconLogo, IconLogoName } from "@assets/image";
import { EventsFlag } from "@assets/image/icons";
import { CircleQuestionIcon, FileIcon } from "@assets/image/icons/sidebar";

export const Sidebar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
	const { user, getEnrichedOrganizations } = useOrganizationStore();
	const { isNewLogs, setSystemLogHeight, systemLogHeight } = useLoggerStore();
	const location = useLocation();
	const { t } = useTranslation("sidebar");
	const addToast = useToastStore((state) => state.addToast);

	useEffect(() => {
		setIsOpen(false);
	}, [location.pathname]);

	const loadOrganizations = async () => {
		const { data, error } = await getEnrichedOrganizations();
		if (error || !data) {
			addToast({
				message: t("organizationFetchingFailed"),
				type: "error",
			});
			return;
		}
	};

	useEffect(() => {
		if (!descopeProjectId) return;
		if (descopeProjectId && user) {
			loadOrganizations();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user]);

	const animateVariant = {
		hidden: { opacity: 0, width: 0 },
		visible: { opacity: 1, transition: { duration: 0.35, ease: "easeOut" }, width: "auto" },
	};

	return (
		<Suspense fallback={<Loader isCenter size="lg" />}>
			<div className={cn("relative z-30 flex h-full items-start", { "z-50": isFeedbackOpen })}>
				<div className="z-10 flex h-full flex-col justify-between bg-white p-2.5 pb-3 pt-6">
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
							className="mt-7 w-full justify-center gap-2 p-0.5 hover:bg-green-200"
							onClick={() => setIsOpen(!isOpen)}
							title={isOpen ? t("closeSidebar") : t("openSidebar")}
						>
							<MenuToggle className="flex w-9 items-center justify-center pb-1 pt-2" isOpen={isOpen} />

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
						<Tooltip content={t("events")} hide={isOpen} position="right">
							<Button ariaLabel={t("events")} className="p-0 hover:bg-green-200" href="/events">
								<div className="flex size-10 items-center justify-center rounded-full pl-0.5">
									<IconSvg className="size-5 transition" src={EventsFlag} />
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
						</Tooltip>
						<Tooltip content={t("systemLog")} hide={isOpen} position="right">
							<Button
								ariaLabel={t("systemLog")}
								className="w-full p-0 hover:bg-green-200"
								onClick={() => setSystemLogHeight(systemLogHeight < 1 ? 20 : 0)}
							>
								<div className="flex size-10 items-center justify-center rounded-full pl-0.5">
									<Badge
										anchorOrigin={{ vertical: "top", horizontal: "left" }}
										ariaLabel={t("logToReview")}
										className="absolute"
										isVisible={isNewLogs}
										variant="dot"
									>
										<IconSvg className="size-5.5 fill-gray-1100 transition" src={FileIcon} />
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
						</Tooltip>
						<Tooltip content={t("intro")} hide={isOpen} position="right">
							<Button className="w-full p-0 hover:bg-green-200" href="/intro">
								<div className="flex size-10 items-center justify-center rounded-full pl-0.5">
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
						</Tooltip>
						{descopeProjectId ? (
							<PopoverWrapper interactionType="click" placement="right-start">
								<PopoverTrigger className="ml-2 mt-2 flex items-center">
									<Avatar color="black" name={user?.name} round={true} size="25" />
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
								<PopoverContent className="z-40 min-w-56 rounded-2xl border border-gray-950 bg-white px-3.5 py-2.5 font-averta shadow-2xl">
									<UserMenu openFeedbackForm={() => setIsFeedbackOpen(true)} />
								</PopoverContent>
							</PopoverWrapper>
						) : null}
					</div>
					<UserFeedbackForm
						className="absolute bottom-0 left-20"
						isOpen={isFeedbackOpen}
						onClose={() => setIsFeedbackOpen(false)}
					/>
				</div>
			</div>
			<NewProjectModal />
		</Suspense>
	);
};
