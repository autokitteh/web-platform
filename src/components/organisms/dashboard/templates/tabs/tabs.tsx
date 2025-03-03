import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useTranslation } from "react-i18next";

import { defaultTemplateProjectCategory } from "@constants";
import { ModalName } from "@src/enums/components";
import { TemplateMetadata } from "@src/interfaces/store";
import { useModalStore, useTemplatesStore } from "@src/store";

import { Loader } from "@components/atoms";
import { PopoverListContent, PopoverListTrigger, PopoverListWrapper } from "@components/molecules/popover";
import {
	ProjectTemplateCard,
	ProjectTemplateCreateModal,
	CategoriesMenuPopoverItem,
} from "@components/organisms/dashboard/templates/tabs";

import { ChevronDownIcon } from "@assets/image/icons";

export const ProjectTemplatesTabs = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "templates" });
	const { openModal } = useModalStore();
	const { error, fetchTemplates, isLoading, sortedCategories: categories } = useTemplatesStore();
	const [parent] = useAutoAnimate();
	const initialCategory = useMemo(() => [defaultTemplateProjectCategory], []);
	const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory);
	const [selectedTemplate, setSelectedTemplate] = useState<TemplateMetadata>();

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

	const handleSelectClick = useCallback(
		(category: string) => {
			setSelectedCategories((prevSelects) => {
				if (prevSelects.length === 1 && prevSelects.includes(category)) return prevSelects;
				if (prevSelects.length === categories?.length) return [category];
				return prevSelects.includes(category)
					? prevSelects.filter((select) => select !== category)
					: [...prevSelects, category];
			});
		},
		[categories]
	);

	const handleItemSelect = useCallback(
		({ id }: { id: string }) => {
			if (id === "all") {
				setSelectedCategories(categories!.map((category) => category.name));
				return;
			}
			handleSelectClick(id);
		},
		[categories, handleSelectClick]
	);

	const activeCategories = useMemo(
		() => categories?.filter((category) => selectedCategories.includes(category.name)),
		[selectedCategories, categories]
	);

	const isAllSelected = useMemo(
		() => selectedCategories.length === categories?.length,
		[selectedCategories, categories]
	);

	const selectedCategoriesLabel = useMemo(
		() => (isAllSelected ? "All" : selectedCategories.join(", ")),
		[isAllSelected, selectedCategories]
	);

	const totalTemplatesCount = useMemo(
		() => categories?.reduce((count, category) => count + category.templates.length, 0) || 0,
		[categories]
	);

	const popoverCategoriesItems = useMemo(
		() => [
			{
				id: "all",
				label: (
					<CategoriesMenuPopoverItem
						count={totalTemplatesCount}
						isCurrentCategory={isAllSelected}
						name="All"
					/>
				),
			},
			...(categories?.map(({ name, templates }) => ({
				id: name,
				label: (
					<CategoriesMenuPopoverItem
						count={templates.length}
						isCurrentCategory={isAllSelected ? false : selectedCategories.includes(name)}
						name={name}
					/>
				),
			})) || []),
		],

		[categories, selectedCategories, isAllSelected, totalTemplatesCount]
	);

	return (
		<div className="flex h-full flex-1 flex-col">
			{error ? <div className="mb-8 text-center text-xl text-error">{error}</div> : null}
			{isLoading ? (
				<Loader isCenter />
			) : (
				<>
					<PopoverListWrapper animation="slideFromBottom" interactionType="click">
						<PopoverListTrigger className="flex w-full max-w-96 items-center justify-between rounded-lg border border-gray-750 px-2.5 py-2">
							<div className="truncate text-base text-white">{selectedCategoriesLabel}</div>
							<ChevronDownIcon className="size-4 fill-gray-750" />
						</PopoverListTrigger>
						<PopoverListContent
							className="z-40 flex w-full max-w-96 flex-col gap-0.5 rounded-lg border border-gray-750 bg-white p-1 pt-1.5 text-black"
							displaySearch={categories!.length > 5}
							emptyListMessage={t("noCategoriesFound")}
							items={popoverCategoriesItems}
							maxItemsToShow={5}
							onItemSelect={handleItemSelect}
						/>
					</PopoverListWrapper>
					<div className="mt-4 grid grid-cols-auto-fit-248 gap-x-4 gap-y-5 pb-5 text-black" ref={parent}>
						{activeCategories?.flatMap((category) =>
							category.templates.map((template, index) => (
								<ProjectTemplateCard
									category={category.name}
									key={index}
									onCreateClick={() => handleCardCreateClick(template)}
									template={template}
								/>
							))
						)}
					</div>
				</>
			)}
			{selectedTemplate ? (
				<ProjectTemplateCreateModal
					cardTemplate={selectedTemplate}
					category={activeCategories?.map((cat) => cat.name).join(", ")}
				/>
			) : null}
		</div>
	);
};
