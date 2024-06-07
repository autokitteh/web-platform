import React, { useEffect, useState } from "react";
import { ProjectsIcon } from "@assets/image";
import { Button, IconSvg } from "@components/atoms";
import { useProjectStore } from "@store/useProjectStore";
import { useToastStore } from "@store/useToastStore";
import { ProjectMenuItem } from "@type/models";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

export const StatsTopbar = () => {
	const { t } = useTranslation(["projects", "errors"]);
	const { projectId } = useParams();
	const [project, setProject] = useState<ProjectMenuItem>();
	const addToast = useToastStore((state) => state.addToast);
	const { t: tErrors } = useTranslation(["errors"]);

	const { getProject } = useProjectStore();

	useEffect(() => {
		loadProject(projectId!);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	const loadProject = async (projectId: string) => {
		const { data: project, error } = await getProject(projectId);
		if (error) {
			addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
				title: tErrors("error"),
			});
			return <div />;
		}
		if (!project) {
			addToast({
				id: Date.now().toString(),
				message: "project not found",
				type: "error",
				title: tErrors("error"),
			});
			return <div />;
		}
		setProject(project);
	};

	return (
		<div className="flex justify-between items-center bg-gray-800 gap-5 pl-7 pr-3.5 py-3 rounded-b-xl">
			<div className="flex items-end gap-3 relative font-fira-code text-gray-300">
				<span className="font-bold text-xl leading-6">{project?.name}</span>
				<span className="font-semibold leading-tight text-sm">{project?.id}</span>
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
			</div>
		</div>
	);
};
