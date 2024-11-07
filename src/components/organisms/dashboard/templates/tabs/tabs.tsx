import React, { useCallback, useEffect, useMemo, useState } from "react";

import { defaultTemplateProjectCategory } from "@constants";
import { ModalName } from "@src/enums/components";
import { useModalStore, useTemplatesStore } from "@src/store";
import { TemplateMetadata } from "@src/types/components";

import { Loader, Tab } from "@components/atoms";
import { ProjectTemplateCard, ProjectTemplateCreateModal } from "@components/organisms/dashboard/templates/tabs";

export const ProjectTemplatesTabs = () => {
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
	}, [fetchTemplates]);

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
					<div className="sticky -top-8 z-20 -mt-5 bg-gray-1250 pb-0 pt-3">
						<div className="xl:gap-4 scrollbar flex shrink-0 select-none items-center gap-2 overflow-x-auto overflow-y-hidden whitespace-nowrap py-2 2xl:gap-5 3xl:gap-6">
							{categories?.map(({ name }) => (
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
						{activeCategory?.templates.map((template, index) => (
							<ProjectTemplateCard
								category={activeCategory.name}
								key={index}
								onCreateClick={() => handleCardCreateClick(template)}
								template={template}
							/>
						))}
					</div>
				</>
			)}
			{selectedTemplate ? (
				<ProjectTemplateCreateModal cardTemplate={selectedTemplate} category={activeCategory?.name} />
			) : null}
		</div>
	);
};
