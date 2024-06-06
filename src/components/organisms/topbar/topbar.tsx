import React, { useEffect, useState } from "react";
import { FullScreen, More } from "@assets/image";
import { Build, Deploy, Stats } from "@assets/image";
import { Button, ErrorMessage, IconButton, IconSvg, Spinner, Toast } from "@components/atoms";
import { DropdownButton } from "@components/molecules";
import { TopbarButton } from "@enums/components";
import { ProjectsService } from "@services";
import { useProjectStore } from "@store";
import { ProjectMenuItem } from "@type/models";
import { cn } from "@utilities";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

export const Topbar = () => {
	const { t } = useTranslation(["projects", "errors", "buttons"]);
	const { projectId } = useParams();
	const {
		currentProject: { resources },
		getProject,
		renameProject,
	} = useProjectStore();
	const [isNameValid, setIsNameValid] = useState<boolean>(true);
	const [loadingButton, setLoadingButton] = useState<Record<string, boolean>>({});
	const [project, setProject] = useState<ProjectMenuItem>();
	const [toast, setToast] = useState({ isOpen: false, isSuccess: false, message: "" });

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
				setToast({ isSuccess: false, isOpen: true, message: (error as Error).message });
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
		setToast({
			isSuccess: !error,
			isOpen: true,
			message: error ? (error as Error).message : t("topbar.buildProjectSuccess"),
		});

		setLoadingButton((prev) => ({ ...prev, [TopbarButton.build]: false }));
	};

	const deploy = async () => {
		if (!Object.keys(resources).length) return <div />;

		setLoadingButton((prev) => ({ ...prev, [TopbarButton.deploy]: true }));

		const { error } = await ProjectsService.run(projectId!, resources);
		setToast({
			isSuccess: !error,
			isOpen: true,
			message: error ? (error as Error).message : t("topbar.deployedProjectSuccess"),
		});

		setLoadingButton((prev) => ({ ...prev, [TopbarButton.deploy]: false }));
	};

	const toastProps = {
		duration: 5,
		isOpen: toast.isOpen,
		onClose: () => setToast({ ...toast, isOpen: false }),
		title: toast.isSuccess ? t("topbar.success") : t("error", { ns: "errors" }),
	};

	const loadProject = async (projectId: string) => {
		const { data: project, error } = await getProject(projectId);
		if (error) {
			setToast({ isSuccess: false, isOpen: true, message: (error as Error).message });
			return <div />;
		}
		if (!project) {
			setToast({ isSuccess: false, isOpen: true, message: "project not found" });
			return <div />;
		}
		setProject(project);
	};

	return (
		<div className="flex justify-between items-center bg-gray-800 gap-5 pl-7 pr-3.5 py-3 rounded-b-xl">
			<div className="flex items-end gap-3 relative font-fira-code text-gray-300">
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
				<ErrorMessage className="-bottom-5 text-xs">
					{!isNameValid ? t("nameRequired", { ns: "errors" }) : null}
				</ErrorMessage>
				<span className="font-semibold leading-tight text-sm">{project?.id}</span>
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
				<DropdownButton
					className="font-semibold text-white"
					contentMenu={
						<div className="flex flex-col gap-2">
							<Button className="px-4 py-1.5 font-semibold text-white whitespace-nowrap" disabled variant="outline">
								<IconSvg className="w-4" disabled src={Stats} />
								{t("topbar.buttons.stats")}
							</Button>
						</div>
					}
				>
					<Button className="h-full text-white px-4 hover:bg-gray-700" variant="outline">
						<More />
						{t("more", { ns: "buttons" })}
					</Button>
				</DropdownButton>
				<IconButton disabled variant="outline">
					<FullScreen />
				</IconButton>
			</div>

			<Toast {...toastProps} ariaLabel={toast.message} type={toast.isSuccess ? "success" : "error"}>
				<p className="mt-1 text-xs">{toast.message}</p>
			</Toast>
		</div>
	);
};
