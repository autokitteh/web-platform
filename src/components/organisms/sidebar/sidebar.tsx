import React, { Suspense, useEffect, useMemo, useState } from "react";

import { AnimatePresence, motion } from "motion/react";
import Avatar from "react-avatar";
import { useTranslation } from "react-i18next";
import { LuUnplug, LuX } from "react-icons/lu";
import { useLocation, useNavigate } from "react-router-dom";

import { descopeProjectId, featureFlags } from "@constants";
import { cn } from "@src/utilities";

import { useWindowDimensions } from "@hooks";
import { useLoggerStore, useOrganizationStore, useToastStore } from "@store";

import { Badge, Button, IconSvg, Loader, Tooltip } from "@components/atoms";
import { MenuToggle } from "@components/atoms/menuToggle";
import { PopoverWrapper, PopoverContent, PopoverTrigger } from "@components/molecules/popover";
import { ProjectsMenu } from "@components/molecules/projectsMenu";
import { UserFeedbackForm } from "@components/organisms";
import { UserMenu } from "@components/organisms/sidebar";

import { IconLogo, IconLogoName } from "@assets/image";
import { EventsFlag } from "@assets/image/icons";
import { CircleQuestionIcon, FileIcon } from "@assets/image/icons/sidebar";

export const Sidebar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
	const { isMobile } = useWindowDimensions();
	const { user, getEnrichedOrganizations, currentOrganization } = useOrganizationStore();
	const { isNewLogs, setSystemLogHeight, setNewLogs, lastLogType, systemLogHeight } = useLoggerStore();
	const location = useLocation();
	const { t } = useTranslation("sidebar");
	const addToast = useToastStore((state) => state.addToast);
	const navigate = useNavigate();

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
		if (descopeProjectId && user && currentOrganization) {
			loadOrganizations();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, currentOrganization]);

	const handleLogoClick = () => {
		navigate("/");
	};

	const animateVariant = {
		hidden: { opacity: 0, width: 0 },
		visible: { opacity: 1, transition: { duration: 0.35, ease: "easeOut" as const }, width: "auto" },
	};

	const toggleSystemLogHeight = () => {
		setNewLogs(false);
		setSystemLogHeight(systemLogHeight < 1 ? 20 : 0);
	};

	const rootClassName = useMemo(
		() => cn("relative z-30 flex h-full items-start", { "z-50": isFeedbackOpen }),
		[isFeedbackOpen]
	);

	const mobileMenuItemClass =
		"w-full !justify-start gap-4 rounded-xl px-4 py-3.5 text-lg text-left hover:bg-green-200 active:bg-green-400 min-h-[52px]";

	if (isMobile) {
		return (
			<Suspense fallback={<Loader isCenter size="lg" />}>
				<div className="fixed left-0 top-0 z-40 flex h-12 w-full items-center justify-between bg-white px-3 shadow-sm">
					<Button className="flex items-center gap-2 p-1" onClick={handleLogoClick} variant="ghost">
						<IconLogo className="size-7" />
					</Button>
					<Button
						ariaLabel={isOpen ? t("closeSidebar") : t("openSidebar")}
						className="p-2 hover:bg-green-200"
						onClick={() => setIsOpen(!isOpen)}
						title={isOpen ? t("closeSidebar") : t("openSidebar")}
					>
						<MenuToggle className="flex w-6 items-center justify-center" isOpen={isOpen} />
					</Button>
				</div>

				<AnimatePresence>
					{isOpen ? (
						<motion.div
							animate={{ opacity: 1 }}
							className="fixed inset-0 z-50 flex flex-col bg-white"
							exit={{ opacity: 0 }}
							initial={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
						>
							<div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
								<Button
									className="flex items-center gap-2.5 p-0"
									onClick={handleLogoClick}
									variant="ghost"
								>
									<IconLogo className="size-8" />
									<IconLogoName className="h-4 w-24" />
								</Button>
								<motion.button
									aria-label={t("closeSidebar")}
									className="rounded-lg p-2 hover:bg-green-200"
									onClick={() => setIsOpen(false)}
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
								>
									<LuX className="size-6 text-gray-700" />
								</motion.button>
							</div>

							<div className="flex flex-1 flex-col overflow-y-auto p-4">
								<div className="flex flex-col gap-2">
									<ProjectsMenu className="mb-3" isOpen={true} />

									{featureFlags.hideOrgConnections ? null : (
										<Button
											ariaLabel={t("connections")}
											className={mobileMenuItemClass}
											href="/connections"
										>
											<LuUnplug className="size-6 fill-gray-1100" strokeWidth={2} />
											<span>{t("connections")}</span>
										</Button>
									)}

									<Button ariaLabel={t("events")} className={mobileMenuItemClass} href="/events">
										<IconSvg className="size-6 fill-gray-1100" src={EventsFlag} />
										<span>{t("events")}</span>
									</Button>

									<Button
										ariaLabel={t("systemLog")}
										className={mobileMenuItemClass}
										onClick={() => {
											toggleSystemLogHeight();
											setIsOpen(false);
										}}
									>
										<Badge
											anchorOrigin={{ vertical: "top", horizontal: "left" }}
											ariaLabel={t("logToReview")}
											isVisible={isNewLogs}
											lastLogType={lastLogType}
											variant="dot"
										>
											<IconSvg className="size-6 fill-gray-1100" src={FileIcon} />
										</Badge>
										<span>{t("systemLog")}</span>
									</Button>

									<Button className={mobileMenuItemClass} href="/intro">
										<IconSvg className="size-6" src={CircleQuestionIcon} />
										<span>{t("intro")}</span>
									</Button>
								</div>

								{descopeProjectId ? (
									<div className="mt-auto border-t border-gray-200 pt-4">
										<div className="flex items-center gap-3 px-3">
											<Avatar color="black" name={user?.name} round={true} size="36" />
											<span className="truncate text-base font-medium text-black">
												{user?.name}
											</span>
										</div>
									</div>
								) : null}
							</div>
						</motion.div>
					) : null}
				</AnimatePresence>
			</Suspense>
		);
	}

	return (
		<Suspense fallback={<Loader isCenter size="lg" />}>
			<div className={rootClassName}>
				<div
					className={cn(
						"z-10 flex h-full flex-col justify-between bg-white p-2.5 pb-3 pt-6",
						isOpen && "pr-6"
					)}
				>
					<div>
						<Button
							className="ml-1 flex items-center justify-start gap-2.5"
							onClick={handleLogoClick}
							variant="ghost"
						>
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
						</Button>
						<Button
							ariaLabel={isOpen ? t("closeSidebar") : t("openSidebar")}
							className="mt-7 w-full p-0 hover:bg-green-200"
							onClick={() => setIsOpen(!isOpen)}
							title={isOpen ? t("closeSidebar") : t("openSidebar")}
						>
							<div className="flex size-10 items-center justify-center rounded-full pl-0.5">
								<MenuToggle className="flex w-6 items-center justify-center" isOpen={isOpen} />
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
										{t("closeSidebar")}
									</motion.span>
								) : null}
							</AnimatePresence>
						</Button>

						<ProjectsMenu className="mt-5" isOpen={isOpen} />

						{featureFlags.hideOrgConnections ? null : (
							<Tooltip content={t("connections")} hide={isOpen} position="right">
								<Button
									ariaLabel={t("connections")}
									className="mt-3 gap-1.5 p-0.5 hover:bg-green-200"
									href="/connections"
								>
									<div className="flex size-9 items-center justify-center">
										<LuUnplug className="size-5 fill-gray-1100" strokeWidth={2} />
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
												{t("connections")}
											</motion.span>
										) : null}
									</AnimatePresence>
								</Button>
							</Tooltip>
						)}
					</div>

					<div className="flex flex-col gap-2">
						<Tooltip content={t("events")} hide={isOpen} position="right">
							<Button ariaLabel={t("events")} className="gap-1.5 p-0.5 hover:bg-green-200" href="/events">
								<div className="flex size-9">
									<IconSvg className="fill-gray-1100" size="xl" src={EventsFlag} />
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
								className="gap-1.5 p-0.5 hover:bg-green-200"
								onClick={() => toggleSystemLogHeight()}
							>
								<div className="flex size-9 items-center justify-center">
									<Badge
										anchorOrigin={{ vertical: "top", horizontal: "left" }}
										ariaLabel={t("logToReview")}
										className="absolute"
										isVisible={isNewLogs}
										lastLogType={lastLogType}
										variant="dot"
									>
										<IconSvg className="fill-gray-1100" size="xl" src={FileIcon} />
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
							<Button className="gap-1.5 p-0.5 hover:bg-green-200" href="/intro">
								<div className="flex size-9">
									<IconSvg size="xl" src={CircleQuestionIcon} />
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
								<PopoverTrigger className="ml-2 mt-2">
									<div className="flex items-center">
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
									</div>
								</PopoverTrigger>
								<PopoverContent className="min-w-56 rounded-2xl border border-gray-950 bg-white px-3.5 py-2.5 font-averta shadow-2xl">
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
		</Suspense>
	);
};
