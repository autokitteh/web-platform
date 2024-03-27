import React, { useEffect, useState } from "react";
import { FullScreen, More } from "@assets/image";
import { Button, ErrorMessage, IconButton, IconSvg, Toast } from "@components/atoms";
import { DropdownButton } from "@components/molecules";
import { topbarItems } from "@constants";
import { ProjectsService } from "@services";
import { useProjectStore } from "@store";
import { Project } from "@type/models";
import { cn } from "@utilities";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

export const Topbar = () => {
	const { projectId } = useParams();
	const { t } = useTranslation(["shared", "errors"]);
	const { getProjectsList } = useProjectStore();
	const [project, setProject] = useState<Project>({
		name: "",
		projectId: "",
	});
	const [isNameValid, setIsNameValid] = useState<boolean>(true);
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});

	const styleInput = cn(
		"font-bold p-0 text-xl leading-6 bg-transparent min-w-3 outline outline-0 rounded leading-tight",
		{
			"outline-error outline-2": !isNameValid,
		}
	);

	useEffect(() => {
		if (!projectId) return;
		const fetchProject = async () => {
			const { data } = await ProjectsService.get(projectId);
			data && setProject(data);
		};
		fetchProject();
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
				setToast({ isOpen: true, message: (error as Error).message });
				return;
			}
			(e.target as HTMLSpanElement).blur();
			setIsNameValid(isValidName);
			getProjectsList();
		}
	};

	const handleInput = (e: React.ChangeEvent<HTMLSpanElement>) => {
		const newName = e.target.textContent?.trim() || "";
		setIsNameValid(validateName(newName));
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
					title={t("rename")}
				>
					{project.name}
				</span>
				<ErrorMessage className="-bottom-5 text-xs">
					{!isNameValid ? t("nameRequired", { ns: "errors" }) : null}
				</ErrorMessage>
				<span className="font-semibold leading-tight text-sm">{project.projectId}</span>
			</div>
			<div className="flex items-stretch gap-3">
				{topbarItems.map(({ id, name, href, icon, disabled }) => (
					<Button
						className="px-4 py-2 font-semibold text-white whitespace-nowrap hover:bg-gray-700"
						disabled={disabled}
						href={href}
						key={id}
						variant="outline"
					>
						<IconSvg className="max-w-5" disabled={disabled} src={icon} />
						{name}
					</Button>
				))}
				<DropdownButton
					className="font-semibold text-white"
					contentMenu={
						<div className="flex flex-col gap-2">
							{topbarItems.map(({ id, name, href, icon, disabled }) => (
								<Button
									className="px-4 py-1.5 font-semibold text-white whitespace-nowrap"
									disabled={disabled}
									href={href}
									key={id}
									variant="outline"
								>
									<IconSvg className="w-4" disabled={disabled} src={icon} />
									{name}
								</Button>
							))}
						</div>
					}
				>
					<Button className="h-full text-white px-4 hover:bg-gray-700" variant="outline">
						<More />
						{t("more")}
					</Button>
				</DropdownButton>
				<IconButton disabled variant="outline">
					<FullScreen />
				</IconButton>
			</div>
			<Toast
				className="border-error"
				duration={5}
				isOpen={toast.isOpen}
				onClose={() => setToast({ ...toast, isOpen: false })}
			>
				<h5 className="font-semibold text-error">Error</h5>
				<p className="mt-1 text-xs">{toast.message}</p>
			</Toast>
		</div>
	);
};
