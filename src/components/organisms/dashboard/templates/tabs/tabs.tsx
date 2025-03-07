import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useTranslation } from "react-i18next";

import { defaultTemplateProjectCategory, defaultSelectedMultipleSelect } from "@constants";
import { integrationTypes } from "@constants/lists";
import { ModalName } from "@src/enums/components";
import { TemplateMetadata } from "@src/interfaces/store";
import { useModalStore, useTemplatesStore } from "@src/store";

import { Loader } from "@components/atoms";
import {
	ProjectTemplateCard,
	ProjectTemplateCreateModal,
	MultiplePopoverSelect,
} from "@components/organisms/dashboard/templates/tabs";

export const ProjectTemplatesTabs = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "templates" });
	const { openModal } = useModalStore();
	const { error, fetchTemplates, isLoading, sortedCategories: categories } = useTemplatesStore();
	const [parent] = useAutoAnimate();
	const [selectedTemplate, setSelectedTemplate] = useState<TemplateMetadata>();
	const [selectedCategories, setSelectedCategories] = useState<string[]>([defaultTemplateProjectCategory]);
	const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);

	useEffect(() => {
		fetchTemplates();
	}, [fetchTemplates]);

	const handleCardCreateClick = useCallback(
		(template: TemplateMetadata) => {
			setSelectedTemplate(template);
			openModal(ModalName.templateCreateProject);
		},
		[openModal]
	);

	const popoverCategoriesItems = useMemo(
		() =>
			categories?.map(({ name, templates }) => ({
				id: name,
				label: name,
				count: templates.length,
			})) || [],
		[categories]
	);

	const popoverIntegrationsItems = useMemo(
		() =>
			integrationTypes?.map(({ icon, label }) => ({
				id: label,
				label,
				icon: icon,
			})) || [],
		[]
	);

	const activeCategories = useMemo(
		() =>
			selectedCategories.includes(defaultSelectedMultipleSelect)
				? categories
				: categories?.filter((category) => selectedCategories.includes(category.name)),
		[selectedCategories, categories]
	);

	const filteredTemplates = useMemo(
		() =>
			activeCategories?.flatMap((category) =>
				category.templates.filter(
					(template) =>
						selectedIntegrations.includes(defaultSelectedMultipleSelect) ||
						selectedIntegrations.some((integration) => template.integrations.includes(integration))
				)
			),
		[activeCategories, selectedIntegrations]
	);

	return (
		<div className="flex h-full flex-1 flex-col">
			{error ? <div className="mb-8 text-center text-xl text-error">{error}</div> : null}
			{isLoading ? (
				<Loader isCenter />
			) : (
				<>
					<div className="flex flex-wrap gap-3">
						<MultiplePopoverSelect
							defaultSelectedItems={[defaultTemplateProjectCategory]}
							emptyListMessage={t("noCategories")}
							items={popoverCategoriesItems}
							label={t("categories")}
							onItemsSelected={setSelectedCategories}
						/>
						<MultiplePopoverSelect
							defaultSelectedItems={[defaultSelectedMultipleSelect]}
							emptyListMessage={t("noIntegrations")}
							items={popoverIntegrationsItems}
							label={t("integrations")}
							onItemsSelected={setSelectedIntegrations}
						/>
					</div>

					<div className="mt-4 grid grid-cols-auto-fit-248 gap-x-4 gap-y-5 pb-5 text-black" ref={parent}>
						{filteredTemplates?.map((template) => (
							<ProjectTemplateCard
								category={template.category}
								key={template.title}
								onCreateClick={() => handleCardCreateClick(template)}
								template={template}
							/>
						))}
					</div>
				</>
			)}
			{selectedTemplate ? (
				<ProjectTemplateCreateModal
					cardTemplate={selectedTemplate}
					category={categories?.map((cat) => cat.name).join(", ")}
				/>
			) : null}
		</div>
	);
};
