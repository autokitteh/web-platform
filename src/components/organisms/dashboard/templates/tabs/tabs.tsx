import React, { useCallback, useEffect, useMemo, useState } from "react";

import axios from "axios";
import JSZip, { JSZipObject } from "jszip";

import { defaultTemplateProjectCategory, templateProjectsCategories } from "@constants";
import { useCreateProjectFromTemplate } from "@src/hooks";
import { useProjectStore } from "@src/store";

import { Tab } from "@components/atoms";
import { ProjectTemplateCard } from "@components/organisms/dashboard/templates/tabs";

interface ReadmeFile {
	path: string;
	size: number;
	content: string;
}

export const ProjectTemplatesTabs = () => {
	const [activeTab, setActiveTab] = useState<string>(defaultTemplateProjectCategory);
	const [loadingCardId, setLoadingCardId] = useState<string>();
	const { createProjectFromTemplate } = useCreateProjectFromTemplate();
	const { projectsList } = useProjectStore();
	const [readmeFiles, setReadmeFiles] = useState<ReadmeFile[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const fetchAndExtractReadmes = async () => {
		setLoading(true);
		setError(null);

		try {
			// // Download the ZIP archive from GitHub

			const response = await axios.get("https://api.github.com/repos/autokitteh/kittehub/zipball/main", {
				responseType: "json",
				headers: {
					"Accept": "application/vnd.github+json",
					"Authorization": "Bearer token",
					"X-GitHub-Api-Version": "2022-11-28",
				},
			});

			console.log(response);

			// const response = await axios.get("https://api.github.com/repos/autokitteh/kittehub", {
			// 	responseType: "json",
			// 	headers: {
			// 		"Accept": "application/vnd.github+json",
			// 		"Authorization":
			// 			"Bearer token",
			// 		"X-GitHub-Api-Version": "2022-11-28",
			// 	},
			// });

			// console.log(response);

			// const response2 = await axios.get("https://api.github.com/repos/autokitteh/kittehub/contents", {
			// 	headers: {
			// 		"Accept": "application/vnd.github.object+json",
			// 		"Authorization":
			// 			"Bearer token",
			// 		"X-GitHub-Api-Version": "2022-11-28",
			// 	},
			// });

			// console.log(response2);

			// const response3 = await axios.get(
			// 	"https://api.github.com/repos/autokitteh/kittehub/contents/data_pipeline?ref=main",
			// 	{
			// 		headers: {
			// 			"Accept": "application/vnd.github.object+json",
			// 			"Authorization":
			// 				"Bearer token",
			// 			"X-GitHub-Api-Version": "2022-11-28",
			// 		},
			// 	}
			// );

			// console.log(response3);

			const zip = new JSZip();
			const zipContent = await zip.loadAsync(response.data);
			const extractedReadmeFiles: ReadmeFile[] = [];

			// Loop through files in the ZIP to find README files
			await Promise.all(
				Object.keys(zipContent.files).map(async (relativePath) => {
					const file = zipContent.file(relativePath);

					// Filter for README files
					if (file && /README/i.test(file.name)) {
						const content = await file.async("text");
						const size = new Blob([content]).size; // Calculate size of the uncompressed text

						const readmeMetadata: ReadmeFile = {
							path: relativePath,
							size,
							content,
						};

						extractedReadmeFiles.push(readmeMetadata);
					}
				})
			);

			console.log("Extracted README files:", extractedReadmeFiles);

			setReadmeFiles(extractedReadmeFiles);
		} catch (error) {
			setError("Failed to fetch or process README files.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAndExtractReadmes();
	}, []);

	const activeCategory = useMemo(
		() => templateProjectsCategories.find((category) => category.name === activeTab),
		[activeTab]
	);

	const projectNamesSet = useMemo(() => new Set(projectsList.map((project) => project.name)), [projectsList]);

	const isProjectDisabled = useCallback(
		(assetDirectory: string) => projectNamesSet.has(assetDirectory),
		[projectNamesSet]
	);

	const handleTabClick = useCallback((category: string) => {
		setActiveTab(category);
	}, []);

	const createProjectFromAsset = async (assetDirectory: string) => {
		setLoadingCardId(assetDirectory);
		await createProjectFromTemplate(assetDirectory);
		setLoadingCardId(undefined);
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

			<div className="mt-4 grid grid-cols-auto-fit-248 gap-x-4 gap-y-5 pb-5 text-black">
				{activeCategory
					? activeCategory.cards.map((card, index) => (
							<ProjectTemplateCard
								card={card}
								category={activeCategory.name}
								disabled={isProjectDisabled(card.assetDirectory)}
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
