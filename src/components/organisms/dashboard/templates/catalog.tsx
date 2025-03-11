import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useTranslation } from "react-i18next";

import { defaultSelectedMultipleSelect } from "@constants";
import { integrationTypes } from "@constants/lists";
import { ModalName } from "@src/enums/components";
import { TemplateMetadata } from "@src/interfaces/store";
import { useModalStore, useTemplatesStore } from "@src/store";

import { Frame, IconSvg, Loader, Typography } from "@components/atoms";
import {
	ProjectTemplateCard,
	MultiplePopoverSelect,
	ProjectTemplateCreateModalContainer,
} from "@components/organisms/dashboard/templates/tabs";
import { StartTemplateIcon } from "@assets/image/icons";
import { cn } from "@src/utilities";

export const TemplatesCatalog = ({ fullScreen }: { fullScreen?: boolean }) => {
	const { t } = useTranslation("dashboard", { keyPrefix: "templates" });
	const [selectedTemplate, setSelectedTemplate] = useState<TemplateMetadata>();

		const { openModal } = useModalStore();
		const [parent] = useAutoAnimate();
		const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
		const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);
	const { error, fetchTemplates, isLoading, sortedCategories: categories } = useTemplatesStore();

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
	
		const allTemplates = useMemo(() => {
			if (!categories) return [];
			return categories.flatMap((cat) => cat.templates);
		}, [categories]);
	
		const isDefaultSelected = (list: string[]) => {
			return list.length === 0 || list.includes(defaultSelectedMultipleSelect);
		};
	
		const templatesByCategory = useMemo(() => {
			if (isDefaultSelected(selectedCategories)) {
				return allTemplates;
			}
			return allTemplates.filter((template) => selectedCategories.includes(template.category));
		}, [allTemplates, selectedCategories]);
	
		const filteredTemplates = useMemo(() => {
			if (isDefaultSelected(selectedIntegrations)) {
				return templatesByCategory;
			}
			return templatesByCategory.filter((template) =>
				selectedIntegrations.every((integration) => template.integrations.includes(integration))
			);
		}, [templatesByCategory, selectedIntegrations]);
	
		const filteredCategories = useMemo(() => {
			if (!categories) return [];
	
			if (isDefaultSelected(selectedIntegrations)) {
				return categories.map((category) => ({
					...category,
					count: category.templates.length,
					isVisible: true,
				}));
			}
	
			const filteredCategoryNames = new Set(filteredTemplates.map((template) => template.category));
	
			return categories.map((category) => ({
				...category,
				count: filteredTemplates.filter((template) => template.category === category.name).length,
				isVisible: filteredCategoryNames.has(category.name),
			}));
		}, [categories, filteredTemplates, selectedIntegrations]);
	
		const filteredIntegrations = useMemo(() => {
			if (!integrationTypes) return [];
	
			const filteredIntegrationNames = new Set(filteredTemplates.flatMap((template) => template.integrations));
	
			return integrationTypes.map((integration) => ({
				...integration,
				count: filteredTemplates.filter((template) => template.integrations.includes(integration.value)).length,
				isVisible: filteredIntegrationNames.has(integration.value),
			}));
		}, [filteredTemplates]);
	
		const popoverCategoriesItems = useMemo(
			() =>
				filteredCategories
					.filter((category) => category.isVisible)
					.map(({ name, count }) => ({
						id: name,
						label: name,
						count,
					})),
			[filteredCategories]
		);
	
		const popoverIntegrationsItems = useMemo(
			() =>
				filteredIntegrations
					.filter((integration) => integration.isVisible)
					.map(({ icon, label, value, count }) => ({
						id: value,
						label,
						icon,
						count,
					})),
			[filteredIntegrations]
		);

	const frameClass = cn("h-full rounded-none border-l border-l-gray-750 bg-gray-1250", {
		"mt-1.5 rounded-2xl": fullScreen,
	});

	return (
		<Frame className={frameClass}>
			<Typography
				className="mb-7 flex w-full select-none items-center gap-3 font-averta text-3xl font-semibold"
				element="h2"
			>
				<IconSvg className="size-6 fill-white" src={StartTemplateIcon} />

				{t("title")}
			</Typography>

			<div className="flex h-full flex-1 flex-col">
				{error ? <div className="mb-8 text-center text-xl text-error">{error}</div> : null}
				{isLoading ? (
					<Loader isCenter />
				) : (
					<>
					<div className="grid grid-cols-2 gap-4">
											<MultiplePopoverSelect
												defaultSelectedItems={[defaultSelectedMultipleSelect]}
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
											{filteredTemplates.map((template) => (
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
				{selectedTemplate ? <ProjectTemplateCreateModalContainer template={selectedTemplate} /> : null}
			</div>
		</Frame>
	);
};
