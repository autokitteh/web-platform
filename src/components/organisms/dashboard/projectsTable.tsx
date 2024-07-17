import React, { useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { SidebarHrefMenu } from "@enums/components";
import { ProjectsService } from "@services";
import { Project } from "@type/models";

import { useToastStore } from "@store";

import { Loader, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { SortButton } from "@components/molecules";

export const ProjectsTable = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "projects" });
	const addToast = useToastStore((state) => state.addToast);
	const [isLoading, setIsLoading] = useState(true);
	const [projects, setProjects] = useState<Project[]>([]);
	const navigate = useNavigate();

	const fetchProjectsList = async () => {
		setIsLoading(true);
		try {
			const { data: projects, error } = await ProjectsService.list();
			if (error) {
				throw error;
			}
			if (!projects) {
				return;
			}
			setProjects(projects);
		} catch (error) {
			addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
			});
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchProjectsList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const itemData = useMemo(() => projects, [projects]);

	return isLoading ? (
		<Loader isCenter size="xl" />
	) : (
		<div className="relative mb-3 mt-7">
			<div className="text-2xl font-bold text-black">{t("title")}</div>

			{projects.length ? (
				<Table className="mt-2.5 max-h-96 rounded-t-20 border border-black-300">
					<THead className="bg-white">
						<Tr className="border-none pl-6 hover:bg-transparent">
							<Th className="group h-11 cursor-pointer font-normal text-gray-dark">
								{t("table.columns.projectName")}

								<SortButton className="opacity-0 group-hover:opacity-100" />
							</Th>
						</Tr>
					</THead>

					<TBody className="bg-gray-black-200">
						{itemData.map(({ name, projectId }) => (
							<Tr
								className="group cursor-pointer border-none pl-6 text-black-text hover:bg-transparent"
								key={projectId}
							>
								<Td
									className="group-hover:font-bold"
									onClick={() => navigate(`/${SidebarHrefMenu.projects}/${projectId}`)}
								>
									{name}
								</Td>
							</Tr>
						))}
					</TBody>
				</Table>
			) : (
				<div className="mt-10 text-center text-xl font-semibold text-black">{t("noProjects")}</div>
			)}
		</div>
	);
};
