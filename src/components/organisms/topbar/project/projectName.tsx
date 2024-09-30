import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { redirect, useParams } from "react-router-dom";

import { ProjectsService } from "@services";
import { Project } from "@type/models";
import { cn } from "@utilities";

import { useProjectStore, useToastStore } from "@store";

import { ErrorMessage } from "@components/atoms";
import { CopyButton } from "@components/molecules";

export const ProjectTopbarName = () => {
	const { projectId } = useParams();
	const { getProject, renameProject } = useProjectStore();
	const [isNameValid, setIsNameValid] = useState(true);
	const [project, setProject] = useState<Project>();
	const { t } = useTranslation(["projects", "buttons"]);
	const { t: tErrors } = useTranslation("errors");
	const inputClass = cn(
		"min-w-3 rounded bg-transparent p-0 text-xl font-bold leading-6 leading-tight outline outline-0",
		{
			"outline-2 outline-error": !isNameValid,
		}
	);
	const addToast = useToastStore((state) => state.addToast);

	const loadProject = async (projectId: string) => {
		const { data: project, error } = await getProject(projectId);

		if (error || !project) {
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
					message: tErrors("projectUpdateFailed"),
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

	return (
		<div className="flex items-center py-2">
			<div className="relative flex items-center gap-3 font-fira-code text-gray-500">
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

				<ErrorMessage className="-bottom-3.5 text-xs">
					{!isNameValid ? t("nameRequired", { ns: "errors" }) : null}
				</ErrorMessage>

				<span className="flex items-center font-fira-code font-semibold">
					ID
					<CopyButton className="ml-2 inline p-1 pl-1.5" size="xs" text={project?.id || ""} />
				</span>
			</div>
		</div>
	);
};
