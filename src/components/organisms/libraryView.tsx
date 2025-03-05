// src/components/organisms/templates/libraryView.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { defaultTemplateProjectCategory } from "@constants";
import { ModalName } from "@src/enums/components";
import { TemplateMetadata } from "@src/interfaces/store";
import { useModalStore, useTemplatesStore } from "@src/store";

import { Button, Loader, Tab } from "@components/atoms";
import { ProjectTemplateCard, ProjectTemplateCreateModal } from "@components/organisms/dashboard/templates/tabs";

export const TemplatesLibraryView = () => {
	const [activeTab, setActiveTab] = useState<string>(defaultTemplateProjectCategory);
	const [selectedTemplate, setSelectedTemplate] = useState<TemplateMetadata>();

	const { openModal } = useModalStore();
	const { error, fetchTemplates, isLoading, sortedCategories: categories } = useTemplatesStore();

	const activeCategory = useMemo(
		() => categories?.find((category) => category.name === activeTab),
		[activeTab, categories]
	);

	useEffect(() => {
		fetchTemplates();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleTabClick = useCallback((category: string) => {
		setActiveTab(category);
	}, []);

	const handleCardCreateClick = useCallback(
		(template: TemplateMetadata) => {
			setSelectedTemplate(template);
			openModal(ModalName.templateCreateProject);
		},
		[openModal]
	);

	return (
		<div className="flex h-full flex-1 flex-col">
			{error ? <div className="mb-8 text-center text-xl text-error">{error}</div> : null}
			{isLoading ? (
				<Loader isCenter />
			) : (
				<>
					<div className="sticky z-20 bg-gray-1100 pb-4">
						<div className="scrollbar flex shrink-0 select-none items-center gap-4 overflow-x-auto overflow-y-hidden whitespace-nowrap border-b border-gray-800 pb-2">
							{categories?.map(({ name }) => (
								<Tab
									activeTab={activeTab}
									ariaLabel={name}
									className="border-b-4 pb-2 text-lg normal-case"
									key={name}
									onClick={() => handleTabClick(name)}
									value={name}
								>
									{name}
								</Tab>
							))}
						</div>
					</div>

					<div className="mt-6 grid grid-cols-1 gap-6 pb-8 md:grid-cols-2 lg:grid-cols-3">
						{activeCategory?.templates.map((template, index) => (
							<ProjectTemplateCard
								category={activeCategory.name}
								key={index}
								onCreateClick={() => handleCardCreateClick(template)}
								template={template}
							/>
						))}
					</div>

					<div className="mt-auto border-t border-gray-800 pt-8">
						<Button className="rounded-lg bg-gradient-to-r from-green-800 to-green-500 px-6 py-3 font-medium text-black">
							Browse all templates
						</Button>
					</div>
				</>
			)}
			{selectedTemplate ? (
				<ProjectTemplateCreateModal cardTemplate={selectedTemplate} category={activeCategory?.name} />
			) : null}
		</div>
	);
};
