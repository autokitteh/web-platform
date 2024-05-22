import React from "react";
import { FullScreen } from "@assets/image";
import { ProjectsIcon } from "@assets/image";
import { Button, IconButton, IconSvg, Toast } from "@components/atoms";
import { useProject } from "@hooks";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

export const StatsTopbar = () => {
	const { t } = useTranslation(["projects", "errors"]);
	const { projectId } = useParams();
	const { project, toast, setToast } = useProject(projectId);

	const toastProps = {
		duration: 5,
		isOpen: toast.isOpen,
		onClose: () => setToast({ ...toast, isOpen: false }),
		title: t("error", { ns: "errors" }),
	};

	return (
		<div className="flex justify-between items-center bg-gray-800 gap-5 pl-7 pr-3.5 py-3 rounded-b-xl">
			<div className="flex items-end gap-3 relative font-fira-code text-gray-300">
				<span className="font-bold text-xl leading-6">{project.name}</span>
				<span className="font-semibold leading-tight text-sm">{project.projectId}</span>
			</div>
			<div className="flex items-stretch gap-3">
				<Button
					ariaLabel={t("topbar.buttons.goToProject")}
					className="px-4 py-2 font-semibold text-white hover:bg-gray-700"
					href={`/projects/${projectId}`}
					variant="outline"
				>
					<IconSvg className="fill-white w-6 h-6" src={ProjectsIcon} />
					{t("topbar.buttons.goToProject")}
				</Button>

				<IconButton disabled variant="outline">
					<FullScreen />
				</IconButton>
			</div>
			<Toast {...toastProps} ariaLabel={toast.message} type="error">
				<p className="mt-1 text-xs">{toast.message}</p>
			</Toast>
		</div>
	);
};
