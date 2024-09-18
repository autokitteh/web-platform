import React, { useCallback, useMemo, useState } from "react";

import { defaultTemplateProjectCategory, templateProjectsCategories } from "@constants";
import { useCreateProjectFromTemplate } from "@src/hooks";
import { useProjectStore } from "@src/store";

import { Tab } from "@components/atoms";
import { ProjectTemplateCard } from "@components/organisms/dashboard/templates/tabs";

export const ProjectTemplatesTabs = () => {
	const [activeTab, setActiveTab] = useState<string>(defaultTemplateProjectCategory);
	const [loadingCardId, setLoadingCardId] = useState<string>();
	const { createProjectFromTemplate } = useCreateProjectFromTemplate();
	const { projectsList } = useProjectStore();

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

			<div className="mt-4 grid grid-cols-auto-fit-250 gap-x-4 gap-y-5 pb-5 text-black">
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
