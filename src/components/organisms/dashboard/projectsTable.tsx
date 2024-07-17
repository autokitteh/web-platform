import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

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

	return isLoading ? (
		<Loader isCenter size="xl" />
	) : (
		<div className="relative mt-7">
			<div className="text-2xl font-bold text-black">{t("title")}</div>

			<Table className="mt-2.5 max-h-500 rounded-t-20 border border-black-300">
				<THead className="bg-white">
					<Tr className="border-none pl-6 hover:bg-transparent">
						<Th className="group h-11 cursor-pointer font-normal text-gray-dark">
							{t("table.columns.projectName")}

							<SortButton className="opacity-0 group-hover:opacity-100" />
						</Th>
					</Tr>
				</THead>

				<TBody className="bg-gray-black-200">
					{projects.map(({ name, projectId }) => (
						<Tr
							className="group cursor-pointer border-none pl-6 text-black-text hover:bg-transparent"
							key={projectId}
						>
							<Td className="h-12">{name}</Td>
						</Tr>
					))}
				</TBody>
			</Table>
		</div>
	);
};
