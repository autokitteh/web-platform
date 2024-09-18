import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import {
	defaultTemplateProjectCategory,
	findTemplateFilesByAssetDirectory,
	namespaces,
	templateProjectsCategories,
} from "@constants";
import { LoggerService } from "@services";
import { useFileOperations } from "@src/hooks";
import { fetchAllFilesContent, fetchFileContent } from "@src/utilities";

import { useProjectStore, useToastStore } from "@store";

import { Tab } from "@components/atoms";
import { ProjectTemplateCard } from "@components/organisms/dashboard/templates/tabs";

export const ProjectTemplatesTabs = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "templates" });

	const [activeTab, setActiveTab] = useState<string>(defaultTemplateProjectCategory);
	const [loadingCardId, setLoadingCardId] = useState<string>();

	const activeCategory = useMemo(
		() => templateProjectsCategories.find((category) => category.name === activeTab),
		[activeTab]
	);

	const handleTabClick = useCallback((category: string) => {
		setActiveTab(category);
	}, []);

	const addToast = useToastStore((state) => state.addToast);
	const { getProjectsList } = useProjectStore();

	const [projectId, setProjectId] = useState<string | null>(null);
	const [projectTemplateDirectory, setProjectTemplateDirectory] = useState<string>();
	const navigate = useNavigate();

	const { saveAllFiles } = useFileOperations(projectId || "");
	const { createProjectFromManifest } = useProjectStore();

	const getAndSaveFiles = async () => {
		if (!projectTemplateDirectory) {
			addToast({
				message: t("projectCreationFailed"),
				type: "error",
			});

			LoggerService.error(namespaces.manifestService, `${t("projectDirectoryNotConfigured")}`);

			return;
		}

		if (!projectId) {
			addToast({
				message: t("projectCreationFailed"),
				type: "error",
			});

			return;
		}

		const filesPerProject = findTemplateFilesByAssetDirectory(projectTemplateDirectory);

		if (!filesPerProject) {
			addToast({
				message: t("projectTemplateFilesNotFound"),
				type: "error",
			});

			LoggerService.error(namespaces.manifestService, `${t("projectTemplateFilesNotFound")}`);

			return;
		}

		const filesData = await fetchAllFilesContent(`/assets/templates/${projectTemplateDirectory}/`, filesPerProject);

		await saveAllFiles(filesData);

		addToast({
			message: t("projectCreatedSuccessfully"),
			type: "success",
		});

		navigate(`/projects/${projectId}/connections`);
	};

	useEffect(() => {
		if (projectId) {
			getAndSaveFiles();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	const createProjectFromAsset = async (assetDirectory: string) => {
		setLoadingCardId(assetDirectory);
		try {
			const manifestURL = `/assets/templates/${assetDirectory}/autokitteh.yaml`;
			const manifestData = await fetchFileContent(manifestURL);

			if (!manifestData) {
				addToast({
					message: t("projectCreationFailed"),
					type: "error",
				});

				LoggerService.error(
					namespaces.manifestService,
					`${t("projectCreationFailedExtended", { error: t("projectTemplateManifestNotFound") })}`
				);

				return;
			}

			setProjectTemplateDirectory(assetDirectory);

			const { data: projectId, error } = await createProjectFromManifest(manifestData);

			if (error) {
				addToast({
					message: t("projectCreationFailed"),
					type: "error",
				});
				LoggerService.error(namespaces.manifestService, `${t("projectCreationFailedExtended", { error })}`);
			}
			setLoadingCardId(undefined);
			setProjectId(projectId!);
			getProjectsList();
		} catch (error) {
			addToast({
				message: t("projectCreationFailed"),
				type: "error",
			});
			setLoadingCardId(undefined);

			LoggerService.error(namespaces.manifestService, `${t("projectCreationFailedExtended", { error })}`);
		}
	};

	return (
		<div className="flex h-full flex-1 flex-col">
			<div className="sticky -top-8 z-20 -mt-5 bg-gray-1250 pb-0 pt-3">
				<div
					className={
						"flex select-none items-center gap-2 xl:gap-4 2xl:gap-5 3xl:gap-6 " +
						"scrollbar shrink-0 overflow-x-auto overflow-y-hidden whitespace-nowrap py-2"
					}
				>
					{templateProjectsCategories.map(({ name }) => (
						<Tab
							activeTab={activeTab}
							ariaLabel={name}
							className="border-b-4 pb-0 text-lg normal-case"
							key={name}
							onClick={() => handleTabClick(name)}
							value={name}
						>
							{name}
						</Tab>
					))}
				</div>
			</div>

			<div className="mt-4 grid grid-cols-auto-fit-290 gap-x-4 gap-y-5 pb-5 text-black">
				{activeCategory
					? activeCategory.cards.map((card, index) => (
							<ProjectTemplateCard
								card={card}
								category={activeCategory.name}
								isCreating={loadingCardId === card.assetDirectory}
								key={index}
								onCreateClick={() => createProjectFromAsset(card.assetDirectory)}
							/>
						))
					: null}
			</div>
		</div>
	);
};
