import React, { useEffect, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "react-router-dom";

import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { ModalName } from "@enums/components";
import { MenuProps } from "@interfaces/components";
import { LoggerService } from "@services/logger.service";
import { namespaces } from "@src/constants";
import { Project } from "@type/models";
import { cn } from "@utilities";

import { useModalStore, useProjectStore, useToastStore } from "@store";

import { Button, IconSvg } from "@components/atoms";

import { NewProject, ProjectsIcon } from "@assets/image";

export const Menu = ({ className, isOpen = false }: MenuProps) => {
	const { t } = useTranslation(["menu", "errors"]);
	const location = useLocation();
	const { getProjectsList, projectsList } = useProjectStore();
	const [sortedProjectsList, setSortedProjectsList] = useState<Project[]>([]);
	const { openModal } = useModalStore();
	const addToast = useToastStore((state) => state.addToast);
	const { projectId } = useParams();

	useEffect(() => {
		const sortedProjects = projectsList.slice().sort((a, b) => a.name.localeCompare(b.name));
		setSortedProjectsList(sortedProjects);
	}, [projectsList]);

	const animateVariant = {
		hidden: { opacity: 0, width: 0 },
		visible: { opacity: 1, transition: { duration: 0.35, ease: "easeOut" }, width: "auto" },
	};

	const fetchProjects = async () => {
		const { error } = await getProjectsList();
		if (error) {
			addToast({
				message: t("projectsListFetchFailed"),
				type: "error",
			});

			LoggerService.error(
				namespaces.ui.menu,
				t("projectsListFetchFailedExtended", {
					error,
				})
			);
		}
	};

	useEffect(() => {
		fetchProjects();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const isButtonActive = (href: string) => location.pathname.startsWith(href);

	const buttonMenuStyle = (href: string) =>
		cn("relative z-10 w-full gap-1.5 p-0.5 pl-1 group-hover:bg-green-200", {
			"bg-gray-1100": isButtonActive(href) && isOpen,
			"text-white hover:bg-gray-1100": isButtonActive(href),
		});

	const buttonMenuIconStyle = (href: string) =>
		cn("fill-gray-1100", {
			"fill-white p-0.5": isButtonActive(href),
		});

	const buttonMenuIconWrapperStyle = (href: string) =>
		cn("flex h-9 w-9 items-center justify-center rounded-full duration-500", {
			"bg-gray-1100 hover:bg-gray-1100": isButtonActive(href) && !isOpen,
		});

	return (
		<nav aria-label="Main navigation" className={cn(className, "flex flex-col gap-4")}>
			<ul className="ml-0 flex flex-col gap-2">
				<li>
					<Button
						ariaLabel={t("newProject")}
						className="w-full gap-1.5 p-0.5 pl-1 hover:bg-green-200 disabled:opacity-100"
						onClick={() => openModal(ModalName.newProject)}
						title={t("newProject")}
					>
						<div className="flex size-9 items-center justify-center">
							<IconSvg alt={t("newProject")} size="xl" src={NewProject} />
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
									{t("newProject")}
								</motion.span>
							) : null}
						</AnimatePresence>
					</Button>
				</li>
				<Popover>
					<PopoverTrigger>
						<li className="group static">
							<div className="cursor-pointer before:absolute before:left-0 before:h-10 before:w-full" />

							<Button
								ariaLabel={t("myProjects")}
								className={buttonMenuStyle("#")}
								title={t("myProjects")}
							>
								<div className={buttonMenuIconWrapperStyle("#")}>
									<IconSvg
										alt={t("myProjects")}
										className={buttonMenuIconStyle("#")}
										size="xl"
										src={ProjectsIcon}
									/>
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
											{t("myProjects")}
										</motion.span>
									) : null}
								</AnimatePresence>
							</Button>
						</li>
					</PopoverTrigger>
					<PopoverContent className="z-50 rounded-lg bg-white px-4">
						<div className="h-screen pt-[218px]">
							{projectsList?.length ? (
								sortedProjectsList.map(({ href, id, name }) => (
									<Button
										className={cn(
											"text-fira-code whitespace-nowrap px-4 text-gray-1100 hover:bg-green-200 max-w-245 overflow-hidden",
											{
												"bg-gray-1100 text-white hover:bg-gray-1100": id === projectId,
											}
										)}
										href={href}
										key={id}
									>
										{name}
									</Button>
								))
							) : (
								<div className="pt-3 text-black">No projects found</div>
							)}
						</div>
					</PopoverContent>
				</Popover>
			</ul>
		</nav>
	);
};
