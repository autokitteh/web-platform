import React, { useEffect, useState } from "react";
import { Build, Deploy, Stats } from "@assets/image";
import { Button, ErrorMessage, IconSvg, Spinner } from "@components/atoms";
import { TopbarButton } from "@enums/components";
import { ProjectsService } from "@services";
import { useProjectStore, useToastStore } from "@store";
import { ProjectMenuItem } from "@type/models";
import { cn } from "@utilities";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

export const Topbar = () => {
	const { t } = useTranslation(["projects", "errors", "buttons"]);
	const { projectId } = useParams();
	const { resources, getProject, renameProject } = useProjectStore();
	const [isNameValid, setIsNameValid] = useState<boolean>(true);
	const [loadingButton, setLoadingButton] = useState<Record<string, boolean>>({});
	const [project, setProject] = useState<ProjectMenuItem>();
	const addToast = useToastStore((state) => state.addToast);
	const styleInput = cn(
		"font-bold p-0 text-xl leading-6 bg-transparent min-w-3 outline outline-0 rounded leading-tight",
		{
			"outline-error outline-2": !isNameValid,
		}
	);

	useEffect(() => {
		loadProject(projectId!);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	const validateName = (name: string): boolean => {
		const nameLength = name.trim().length;
		return nameLength > 0;
	};

	const handleInputChange = async (e: React.ChangeEvent<HTMLSpanElement> | React.KeyboardEvent<HTMLSpanElement>) => {
		const newName = (e.target as HTMLSpanElement).textContent?.trim() || "";
		const isValidName = validateName(newName);
		const isEnterKey = (e as React.KeyboardEvent<HTMLSpanElement>).key === "Enter";
		const isBlur = e.type === "blur";

		if (isEnterKey) e.preventDefault();

		if ((isEnterKey || isBlur) && isValidName && projectId) {
			const { error } = await ProjectsService.update(projectId, newName);
			if (error) {
				addToast({
					id: Date.now().toString(),
					message: (error as Error).message,
					type: "error",
					title: t("error", { ns: "errors" }),
				});
				return <div />;
			}
			(e.target as HTMLSpanElement).blur();
			setIsNameValid(isValidName);
			renameProject(projectId, newName);
		}
	};

	const handleInput = (e: React.ChangeEvent<HTMLSpanElement>) => {
		const newName = e.target.textContent?.trim() || "";
		setIsNameValid(validateName(newName));
	};

	const build = async () => {
		if (!Object.keys(resources).length) return <div />;

		setLoadingButton((prev) => ({ ...prev, [TopbarButton.build]: true }));

		const { error } = await ProjectsService.build(projectId!, resources);
		if (error) {
			addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
				title: t("error", { ns: "errors" }),
			});
		} else {
			addToast({
				id: Date.now().toString(),
				message: "",
				type: "success",
				title: t("topbar.buildProjectSuccess"),
			});
		}

		setLoadingButton((prev) => ({ ...prev, [TopbarButton.build]: false }));
	};

	const deploy = async () => {
		if (!Object.keys(resources).length) return <div />;

		setLoadingButton((prev) => ({ ...prev, [TopbarButton.deploy]: true }));

		const { error } = await ProjectsService.run(projectId!, resources);
		if (error) {
			addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
				title: t("error", { ns: "errors" }),
			});
		} else {
			addToast({
				id: Date.now().toString(),
				message: "",
				type: "success",
				title: t("topbar.deployedProjectSuccess"),
			});
		}

		setLoadingButton((prev) => ({ ...prev, [TopbarButton.deploy]: false }));
	};

	const loadProject = async (projectId: string) => {
		const { data: project, error } = await getProject(projectId);

		if (error) {
			addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
				title: t("error", { ns: "errors" }),
			});
			return <div />;
		}
		if (!project) {
			addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
				title: "Project not found",
			});
			return <div />;
		}
		setProject(project);
	};

	return (
		<div className="flex justify-between items-center bg-gray-800 gap-5 pl-7 pr-3.5 py-3 rounded-b-xl">
			<div className="relative flex items-end gap-3 text-gray-300 font-fira-code">
				<span
					className={styleInput}
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
				<ErrorMessage className="text-xs -bottom-5">
					{!isNameValid ? t("nameRequired", { ns: "errors" }) : null}
				</ErrorMessage>
				<span className="text-sm font-semibold leading-tight">{project?.id}</span>
			</div>
			<div className="flex items-stretch gap-3">
				<Button
					ariaLabel={t("topbar.buttons.ariaBuildProject")}
					className="px-4 py-2 font-semibold text-white whitespace-nowrap hover:bg-gray-700"
					disabled={loadingButton[TopbarButton.build]}
					onClick={build}
					variant="outline"
				>
					{loadingButton[TopbarButton.build] ? <Spinner /> : <IconSvg className="max-w-5" src={Build} />}
					{t("topbar.buttons.build")}
				</Button>
				<Button
					ariaLabel={t("topbar.buttons.ariaDeployProject")}
					className="px-4 py-2 font-semibold text-white whitespace-nowrap hover:bg-gray-700"
					disabled={loadingButton[TopbarButton.deploy]}
					onClick={deploy}
					variant="outline"
				>
					{loadingButton[TopbarButton.deploy] ? <Spinner /> : <IconSvg className="max-w-5" src={Deploy} />}
					{t("topbar.buttons.deploy")}
				</Button>
				<Button
					ariaLabel={t("topbar.buttons.ariaStats")}
					className="px-4 py-2 font-semibold text-white whitespace-nowrap hover:bg-gray-700"
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
