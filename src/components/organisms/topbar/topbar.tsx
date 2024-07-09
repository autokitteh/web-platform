import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { redirect, useParams } from "react-router-dom";

import { TopbarButton } from "@enums/components";
import { ProjectsService } from "@services";
import { useProjectStore, useToastStore } from "@store";
import { ProjectMenuItem } from "@type/models";
import { cn } from "@utilities";

import { Button, ErrorMessage, IconSvg, Spinner } from "@components/atoms";

import { Build, Deploy, Stats } from "@assets/image";

export const Topbar = () => {
	const { t } = useTranslation(["projects", "errors", "buttons"]);
	const { projectId } = useParams();
	const { getProject, renameProject, resources } = useProjectStore();
	const [isNameValid, setIsNameValid] = useState<boolean>(true);
	const [loadingButton, setLoadingButton] = useState<Record<string, boolean>>({});
	const [project, setProject] = useState<ProjectMenuItem>();
	const addToast = useToastStore((state) => state.addToast);
	const inputClass = cn(
		"min-w-3 rounded bg-transparent p-0 text-xl font-bold leading-6 leading-tight outline outline-0",
		{
			"outline-2 outline-error": !isNameValid,
		}
	);

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
		loadProject(projectId!);
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

				return <div />;
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

	const build = async () => {
		if (!Object.keys(resources).length) {
			return <div />;
		}

		setLoadingButton((prev) => ({ ...prev, [TopbarButton.build]: true }));

		const { error } = await ProjectsService.build(projectId!, resources);
		if (error) {
			addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
			});
		} else {
			addToast({
				id: Date.now().toString(),
				message: t("topbar.buildProjectSuccess"),
				type: "success",
			});
		}

		setLoadingButton((prev) => ({ ...prev, [TopbarButton.build]: false }));
	};

	const deploy = async () => {
		if (!Object.keys(resources).length) {
			return <div />;
		}

		setLoadingButton((prev) => ({ ...prev, [TopbarButton.deploy]: true }));

		const { error } = await ProjectsService.run(projectId!, resources);
		if (error) {
			addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
			});
		} else {
			addToast({
				id: Date.now().toString(),
				message: t("topbar.deployedProjectSuccess"),
				type: "success",
			});
		}

		setLoadingButton((prev) => ({ ...prev, [TopbarButton.deploy]: false }));
	};

	return (
		<div className="flex items-center justify-between gap-5 rounded-b-xl bg-gray-800 py-3 pl-7 pr-3.5">
			<div className="relative flex items-end gap-3 font-fira-code text-gray-300">
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

			<div className="flex items-stretch gap-3">
				<Button
					ariaLabel={t("topbar.buttons.ariaBuildProject")}
					className="whitespace-nowrap px-4 py-2 font-semibold text-white hover:bg-gray-700"
					disabled={loadingButton[TopbarButton.build]}
					onClick={build}
					variant="outline"
				>
					{loadingButton[TopbarButton.build] ? <Spinner /> : <IconSvg className="max-w-5" src={Build} />}

					{t("topbar.buttons.build")}
				</Button>

				<Button
					ariaLabel={t("topbar.buttons.ariaDeployProject")}
					className="whitespace-nowrap px-4 py-2 font-semibold text-white hover:bg-gray-700"
					disabled={loadingButton[TopbarButton.deploy]}
					onClick={deploy}
					variant="outline"
				>
					{loadingButton[TopbarButton.deploy] ? <Spinner /> : <IconSvg className="max-w-5" src={Deploy} />}

					{t("topbar.buttons.deploy")}
				</Button>

				<Button
					ariaLabel={t("topbar.buttons.ariaStats")}
					className="whitespace-nowrap px-4 py-2 font-semibold text-white hover:bg-gray-700"
					href={`/projects/${projectId}/deployments`}
					variant="outline"
				>
					<IconSvg className="max-w-5" src={Stats} />

					{t("topbar.buttons.stats")}
				</Button>
			</div>
		</div>
	);
};
