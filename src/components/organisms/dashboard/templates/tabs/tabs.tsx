import React, { useCallback, useEffect, useMemo, useState } from "react";

import { defaultTemplateProjectCategory, templateFilesURL } from "@constants";
import { useCreateProjectFromTemplate } from "@src/hooks";
import { useProjectStore } from "@src/store";
import { useTemplateStore } from "@src/store/useTemplatesStore";

import { Tab } from "@components/atoms";
import { ProjectTemplateCard } from "@components/organisms/dashboard/templates/tabs";

export const ProjectTemplatesTabs = () => {
	const [activeTab, setActiveTab] = useState<string>(defaultTemplateProjectCategory);
	const [loadingCardId, setLoadingCardId] = useState<string>();

	const { createProjectFromTemplate } = useCreateProjectFromTemplate();
	const { projectsList } = useProjectStore();
	const { categories, fetchAndProcessArchive, isLoading } = useTemplateStore();

	useEffect(() => {
		fetchAndProcessArchive(templateFilesURL);
	}, [fetchAndProcessArchive]);

	const activeCategory = useMemo(
		() => categories.find((category) => category.name === activeTab),
		[categories, activeTab]
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
		try {
			await createProjectFromTemplate(assetDirectory);
		} finally {
			setLoadingCardId(undefined);
		}
	};

	if (isLoading) {
		return (
			<div className="flex h-full items-center justify-center">
				<span>Loading templates...</span>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-1 flex-col">
			<div className="sticky -top-8 z-20 -mt-5 bg-gray-1250 pb-0 pt-3">
				<div className="xl:gap-4 scrollbar flex shrink-0 select-none items-center gap-2 overflow-x-auto overflow-y-hidden whitespace-nowrap py-2 2xl:gap-5 3xl:gap-6">
					{categories.map(({ name }) => (
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
				{activeCategory?.cards.map((card, index) => (
					<ProjectTemplateCard
						card={card}
						category={activeCategory.name}
						disabled={isProjectDisabled(card.assetDirectory)}
						isCreating={loadingCardId === card.assetDirectory}
						key={`${card.assetDirectory}-${index}`}
						onCreateClick={() => createProjectFromAsset(card.assetDirectory)}
					/>
				))}
			</div>
		</div>
	);
};
