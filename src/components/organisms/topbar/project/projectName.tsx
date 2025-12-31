import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { redirect, useParams } from "react-router-dom";

import { ProjectsService } from "@services";
import { Project } from "@type/models";
import { cn } from "@utilities";

import { useProjectStore, useToastStore } from "@store";

import { ErrorMessage, Input } from "@components/atoms";
import { IdCopyButton } from "@components/molecules";

import { EditIcon } from "@assets/image/icons";

export const ProjectTopbarName = () => {
	const { projectId } = useParams();
	const { getProject, renameProject } = useProjectStore();
	const [isNameValid, setIsNameValid] = useState(true);
	const [project, setProject] = useState<Project>();
	const [isEditing, setIsEditing] = useState(false);
	const { t } = useTranslation(["projects", "buttons"]);
	const { t: tErrors } = useTranslation("errors");
	const inputClass = cn(
		"h-auto min-w-3 max-w-240 rounded-lg p-0 text-xl font-bold leading-tight outline outline-0 transition maxScreenWidth-1600:max-w-160",
		{
			"outline-2 outline-error": !isNameValid,
		}
	);
	const addToast = useToastStore((state) => state.addToast);

	const loadProject = async (projectId: string) => {
		const { data: project, error } = await getProject(projectId);

		if (error) {
			addToast({
				message: tErrors("projectLoadingFailed"),
				type: "error",
			});

			return redirect("/404");
		}
		if (!project) {
			addToast({
				message: tErrors("noProjectFound"),
				type: "error",
			});

			return redirect("/404");
		}
		setProject(project);
	};

	useEffect(() => {
		if (!projectId) return;

		loadProject(projectId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	const validateName = (name: string): boolean => {
		return !!name.trim().length;
	};

	const handleInputChange = async (
		event: React.ChangeEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>
	) => {
		const newName = (event.target as HTMLInputElement).value.trim();
		const isValidName = validateName(newName);
		const isEnterKey = (event as React.KeyboardEvent<HTMLInputElement>).key === "Enter";
		const isBlur = event.type === "blur";

		if (isEnterKey) {
			event.preventDefault();
		}
		if ((isEnterKey || isBlur) && isValidName && projectId) {
			const { error } = await ProjectsService.update(projectId, newName);
			if (error) {
				addToast({ message: tErrors("projectUpdateFailed"), type: "error" });

				return;
			}
			renameProject(projectId, newName);
			setIsEditing(false);
		}
	};

	const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newName = event.target.value;
		setProject((prev) => (prev ? { ...prev, name: newName } : undefined));
		setIsNameValid(validateName(newName));
	};

	return (
		<div className="flex items-center gap-3 py-2 font-fira-code">
			{isEditing ? (
				<Input
					// eslint-disable-next-line jsx-a11y/no-autofocus
					autoFocus={true}
					classInput={inputClass}
					className="p-0"
					onBlur={handleInputChange}
					onChange={handleInput}
					onKeyDown={handleInputChange}
					size={project?.name?.length || 1}
					tabIndex={0}
					title={t("topbar.rename")}
					value={project?.name}
				/>
			) : (
				<div
					aria-label={t("topbar.ariaEditProjectTitle")}
					className="group relative flex cursor-pointer items-center"
					onClick={() => setIsEditing(true)}
					onKeyDown={() => setIsEditing(true)}
					role="button"
					tabIndex={0}
				>
					<EditIcon className="absolute -left-4 size-4 bg-gray-1250 fill-white p-0.5 opacity-0 transition group-hover:opacity-100" />
					<span
						className="max-w-240 truncate text-xl font-bold maxScreenWidth-1600:max-w-160"
						data-testid="project-name"
						title={project?.name}
					>
						{project?.name}
					</span>
				</div>
			)}

			<ErrorMessage className="-bottom-3.5 text-xs">
				{!isNameValid ? t("nameRequired", { ns: "errors" }) : null}
			</ErrorMessage>

			<span className="flex items-center font-fira-code font-semibold text-gray-500">
				<div className="mr-2 pr-0.5">{t("topbar.id")}</div>
				<IdCopyButton hideId id={projectId!} />
			</span>
		</div>
	);
};
