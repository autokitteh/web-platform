import React, { useCallback, useEffect, useMemo, useState } from "react";

import { fetchAndUnpackZip, processReadmeFiles } from "./extractZip";
import { defaultTemplateProjectCategory, templateProjectsCategories } from "@constants";
import { ModalName } from "@src/enums/components";
import { useModalStore } from "@src/store";
import { TemplateCardType } from "@src/types/components";
import { IntegrationsMap } from "@src/enums/components/connection.enum";

import { Tab } from "@components/atoms";
import { ProjectTemplateCard, ProjectTemplateCreateModal } from "@components/organisms/dashboard/templates/tabs";

export const ProjectTemplatesTabs = () => {
	const [activeTab, setActiveTab] = useState<string>(defaultTemplateProjectCategory);
	const [card, setCard] = useState<TemplateCardType>();
	const { openModal } = useModalStore();

	const activeCategory = useMemo(
		() => templateProjectsCategories.find((category) => category.name === activeTab),
		[activeTab]
	);

	const getFiles = async () => {
		const result = await fetchAndUnpackZip();
		if ("structure" in result) {
			const processedCategories = processReadmeFiles(result.structure, IntegrationsMap);
			// eslint-disable-next-line no-console
			console.log("Processed categories:", processedCategories);
		}
	};

	useEffect(() => {
		getFiles();
	}, []);

	const handleTabClick = useCallback((category: string) => {
		setActiveTab(category);
	}, []);

	const handleCardCreateClick = useCallback(
		(card: TemplateCardType) => {
			setCard(card);
			openModal(ModalName.templateCreateProject);
		},
		[openModal]
	);

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
								key={index}
								onCreateClick={() => handleCardCreateClick(card)}
							/>
						))
					: null}
			</div>
			{card ? <ProjectTemplateCreateModal cardTemplate={card} category={activeCategory?.name} /> : null}
		</div>
	);
};
