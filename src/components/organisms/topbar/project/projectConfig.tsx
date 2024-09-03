import React, { useCallback, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { redirect, useParams } from "react-router-dom";

import { ProjectsService } from "@services";
import { DrawerName } from "@src/enums/components";
import { Project } from "@type/models";
import { cn } from "@utilities";

import { useFileOperations } from "@hooks";
import { useDrawerStore, useProjectStore, useToastStore } from "@store";

import { Button, ErrorMessage, IconSvg } from "@components/atoms";
import { ProjectTopbarButtons } from "@components/organisms/topbar/project";

import { RunIcon } from "@assets/image";
import { GearIcon } from "@assets/image/icons";

export const ProjectConfigTopbar = () => {
	const { t } = useTranslation(["projects", "errors", "buttons"]);
	const { projectId } = useParams();
	const { getProject, renameProject } = useProjectStore();
	const [isNameValid, setIsNameValid] = useState<boolean>(true);
	const [project, setProject] = useState<Project>();
	const addToast = useToastStore((state) => state.addToast);
	const { openDrawer } = useDrawerStore();

	const inputClass = cn(
		"min-w-3 rounded bg-transparent p-0 text-xl font-bold leading-6 leading-tight outline outline-0",
		{
			"outline-2 outline-error": !isNameValid,
		}
	);

	const { openProjectId, setOpenFiles, setOpenProjectId } = useFileOperations(projectId!);

	const loadProject = async (projectId: string) => {
		const { data: project, error } = await getProject(projectId);

		if (error) {
			addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
			});

			return redirect("/404");
		}
		if (!project) {
			addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
			});

			return redirect("/404");
		}
		setProject(project);
	};

	useEffect(() => {
		if (!projectId) return;

		loadProject(projectId);
		if (projectId !== openProjectId) {
			setOpenProjectId(projectId);
			setOpenFiles([]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	const validateName = (name: string): boolean => {
		const nameLength = name.trim().length;

		return nameLength > 0;
	};

	const handleInputChange = async (
		event: React.ChangeEvent<HTMLSpanElement> | React.KeyboardEvent<HTMLSpanElement>
	) => {
		const newName = (event.target as HTMLSpanElement).textContent?.trim() || "";
		const isValidName = validateName(newName);
		const isEnterKey = (event as React.KeyboardEvent<HTMLSpanElement>).key === "Enter";
		const isBlur = event.type === "blur";

		if (isEnterKey) {
			event.preventDefault();
		}

		if ((isEnterKey || isBlur) && isValidName && projectId) {
			const { error } = await ProjectsService.update(projectId, newName);
			if (error) {
				addToast({
					id: Date.now().toString(),
					message: (error as Error).message,
					type: "error",
				});

				return;
			}
			(event.target as HTMLSpanElement).blur();
			setIsNameValid(isValidName);
			renameProject(projectId, newName);
		}
	};

	const handleInput = (event: React.ChangeEvent<HTMLSpanElement>) => {
		const newName = event.target.textContent?.trim() || "";
		setIsNameValid(validateName(newName));
	};

	const openManualRunSettings = useCallback(() => {
		openDrawer(DrawerName.projectManualRunSettings);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="flex items-center justify-between gap-5 rounded-b-xl bg-gray-1250 py-2 pl-7 pr-3">
			<div className="flex items-center gap-5">
				<div className="relative flex items-end gap-3 font-fira-code text-gray-500">
					<span
						className={inputClass}
						contentEditable={true}
						onBlur={handleInputChange}
						onInput={handleInput}
						onKeyDown={handleInputChange}
						role="textbox"
						suppressContentEditableWarning={true}
						tabIndex={0}
						title={t("topbar.rename")}
					>
						{project?.name}
					</span>

					<ErrorMessage className="-bottom-5 text-xs">
						{!isNameValid ? t("nameRequired", { ns: "errors" }) : null}
					</ErrorMessage>

					<span className="text-sm font-semibold leading-tight">{project?.id}</span>
				</div>

				<div className="border-1 flex h-8 gap-2 rounded-3xl border border-gray-1000 p-1">
					<Button
						ariaLabel={t("topbar.buttons.ariaSettingsRun")}
						className="h-full whitespace-nowrap p-1"
						onClick={openManualRunSettings}
						title={t("topbar.buttons.ariaSettingsRun")}
						variant="filledGray"
					>
						<IconSvg className="fill-white" src={GearIcon} />
					</Button>

					<Button
						ariaLabel={t("topbar.buttons.manual")}
						className="h-full whitespace-nowrap px-3.5"
						variant="filledGray"
					>
						<IconSvg src={RunIcon} />

						{t("topbar.buttons.manual")}
					</Button>
				</div>
			</div>

			<ProjectTopbarButtons />
		</div>
	);
};
