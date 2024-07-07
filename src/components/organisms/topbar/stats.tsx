import React, { useEffect, useState } from "react";

import { ProjectsIcon } from "@assets/image";
import { Button, IconSvg } from "@components/atoms";
import { useProjectStore } from "@store/useProjectStore";
import { useToastStore } from "@store/useToastStore";
import { ProjectMenuItem } from "@type/models";
import { useTranslation } from "react-i18next";
import { redirect, useParams } from "react-router-dom";

export const StatsTopbar = () => {
	const { t } = useTranslation(["projects", "errors"]);
	const { projectId } = useParams();
	const [project, setProject] = useState<ProjectMenuItem>();
	const addToast = useToastStore((state) => state.addToast);

	const { getProject } = useProjectStore();

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
				message: t("projectNotFound"),
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

	return (
		<div className="bg-gray-800 flex gap-5 items-center justify-between pl-7 pr-3.5 py-3 rounded-b-xl">
			<div className="flex font-fira-code gap-3 items-end relative text-gray-300">
				<span className="font-bold leading-6 text-xl">{project?.name}</span>

				<span className="font-semibold leading-tight text-sm">{project?.id}</span>
			</div>

			<div className="flex gap-3 items-stretch">
				<Button
					ariaLabel={t("topbar.buttons.goToProject")}
					className="font-semibold hover:bg-gray-700 px-4 py-2 text-white"
					href={`/projects/${projectId}`}
					variant="outline"
				>
					<IconSvg className="fill-white h-6 w-6" src={ProjectsIcon} />

					{t("topbar.buttons.goToProject")}
				</Button>
			</div>
		</div>
	);
};
