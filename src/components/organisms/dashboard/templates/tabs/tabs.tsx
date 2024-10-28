import React, { useCallback, useMemo, useState } from "react";

import { defaultTemplateProjectCategory, templateProjectsCategories } from "@constants";
import { ModalName } from "@src/enums/components";
import { useCreateProjectFromTemplate } from "@src/hooks";
import { useModalStore, useProjectStore } from "@src/store";

import { Tab } from "@components/atoms";
import { ProjectTemplateCard, ProjectTemplateCreateModal } from "@components/organisms/dashboard/templates/tabs";

export const ProjectTemplatesTabs = () => {
	const [activeTab, setActiveTab] = useState<string>(defaultTemplateProjectCategory);
	const [cardAssetDirectory, setCardAssetDirectory] = useState<string>();
	const [isCreating, setIsCreating] = useState(false);
	const { createProjectFromTemplate } = useCreateProjectFromTemplate();
	const { projectsList } = useProjectStore();
	const { openModal } = useModalStore();

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

	const handleCardCreateClick = useCallback(
		(assetDirectory: string) => {
			setCardAssetDirectory(assetDirectory);
			openModal(ModalName.templateCreateProject);
		},
		[openModal]
	);

	const createProjectFromAsset = async (assetDirectory: string) => {
		setIsCreating(true);
		await createProjectFromTemplate(assetDirectory);
		setIsCreating(false);
		setCardAssetDirectory(undefined);
	};

	const handleCreate = useCallback(() => {
		if (cardAssetDirectory) {
			createProjectFromAsset(cardAssetDirectory);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cardAssetDirectory]);

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
								isCreating={cardAssetDirectory === card.assetDirectory}
								key={index}
								onCreateClick={() => handleCardCreateClick(card.assetDirectory)}
							/>
						))
					: null}
			</div>

			<ProjectTemplateCreateModal isCreating={isCreating} onCreate={handleCreate} />
		</div>
	);
};
