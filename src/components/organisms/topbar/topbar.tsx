import React, { useEffect, useState } from "react";
import { FullScreen, More } from "@assets/image";
import { Button, ErrorMessage, IconButton, IconSvg } from "@components/atoms";
import { DropdownButton } from "@components/molecules";
import { topbarItems } from "@constants";
import { ProjectsService } from "@services";
import { useUiGlobalStore, useMenuStore } from "@store";
import { Project } from "@type/models";
import { cn } from "@utilities";
import { useTranslation } from "react-i18next";

export const Topbar = () => {
	const { t } = useTranslation(["shared", "errors"]);
	const { newProjectId } = useMenuStore();
	const { isFullScreen, toggleFullScreen } = useUiGlobalStore();
	const [project, setProject] = useState<Project>({
		name: "Slack Monitor",
		projectId: "Version 454462",
	});
	const [isNameValid, setIsNameValid] = useState<boolean>(true);

	const styleIconSreen = cn({ "border-transparent bg-black": isFullScreen });
	const styleInput = cn("font-semibold p-0 text-2xl leading-6 bg-transparent min-w-3 outline outline-0 rounded", {
		"outline-error outline-2": !isNameValid,
	});

	useEffect(() => {
		if (!newProjectId) return;
		const fetchProject = async () => {
			const { data } = await ProjectsService.get(newProjectId);
			data && setProject(data);
		};
		fetchProject();
	}, [newProjectId]);

	const validateName = (name: string): boolean => {
		const nameLength = name.trim().length;
		return nameLength > 0;
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLSpanElement> | React.KeyboardEvent<HTMLSpanElement>) => {
		const newName = (e.target as HTMLSpanElement).textContent?.trim() || "";

		if ((e as React.KeyboardEvent<HTMLSpanElement>).key === "Enter") {
			(e.target as HTMLSpanElement).blur();
		}
		setIsNameValid(validateName(newName));

		if (e.type === "blur") {
			setIsNameValid(validateName(newName));
		}
	};

	const handleInput = (e: React.ChangeEvent<HTMLSpanElement>) => {
		const newName = e.target.textContent?.trim() || "";
		setIsNameValid(validateName(newName));
	};

	return (
		<div className="flex justify-between items-center bg-gray-700 gap-5 pl-7 pr-3.5 py-3 rounded-b-xl">
			<div className="flex items-end gap-3 relative">
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
				<span className="font-semibold text-gray-300 leading-none">{project.projectId}</span>
			</div>
			<div className="flex items-stretch gap-3">
				{topbarItems.map(({ id, name, href, icon, disabled }) => (
					<Button
						className="px-4 py-2 font-semibold text-white"
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
									className="px-4 py-1.5 font-semibold text-white"
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
					<Button className="h-full text-white px-4" variant="outline">
						<More />
						{t("more")}
					</Button>
				</DropdownButton>
				<IconButton className={styleIconSreen} onClick={toggleFullScreen} variant="outline">
					<FullScreen />
				</IconButton>
			</div>
		</div>
	);
};
