import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useTranslation } from "react-i18next";

import { defaultTemplateProjectCategory } from "@constants";
import { ModalName } from "@src/enums/components";
import { TemplateMetadata } from "@src/interfaces/store";
import { useModalStore, useTemplatesStore } from "@src/store";

import { Loader, Typography } from "@components/atoms";
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
	const [selectedCategories, setSelectedCategories] = useState<string[]>([defaultTemplateProjectCategory]);
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

	const allCategories = useMemo(() => categories?.map((category) => category.name) || [], [categories]);

	const handleItemSelect = useCallback(
		({ id }: { id: string }) => {
			setSelectedCategories((prev) => {
				const isOnlyOneSelected = prev.length === 1 && prev.includes(id);
				const isAllSelected = prev.length === allCategories.length;

				if (id === "all" || isOnlyOneSelected) return allCategories;
				if (isAllSelected) return [id];

				return prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id];
			});
		},
		[allCategories]
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
		() => (isAllSelected ? t("all") : selectedCategories.join(", ")),
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
						name={t("all")}
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[categories, selectedCategories, isAllSelected, totalTemplatesCount]
	);

	return (
		<div className="flex h-full flex-1 flex-col">
			{error ? <div className="mb-8 text-center text-xl text-error">{error}</div> : null}
			{isLoading ? (
				<Loader isCenter />
			) : (
				<>
					<Typography className="mb-1 text-xs text-gray-500">{t("categories")}</Typography>
					<PopoverListWrapper animation="slideFromBottom" interactionType="click">
						<PopoverListTrigger className="flex w-full max-w-96 items-center justify-between rounded-lg border border-gray-750 px-2.5 py-2">
							<div className="select-none truncate text-base text-white">{selectedCategoriesLabel}</div>
							<ChevronDownIcon className="size-4 fill-gray-750" />
						</PopoverListTrigger>
						<PopoverListContent
							className="z-40 flex w-full max-w-96 flex-col gap-0.5 rounded-lg border border-gray-750 bg-white p-1 pt-1.5 text-black"
							closeOnSelect={false}
							displaySearch={categories!.length > 5}
							emptyListMessage={t("noCategoriesFound")}
							itemClassName="cursor-pointer"
							items={popoverCategoriesItems}
							maxItemsToShow={5}
							onItemSelect={handleItemSelect}
						/>
					</PopoverListWrapper>
					<div className="mt-4 grid grid-cols-auto-fit-248 gap-x-4 gap-y-5 pb-5 text-black" ref={parent}>
						{activeCategories?.flatMap((category) =>
							category.templates.map((template) => (
								<ProjectTemplateCard
									category={category.name}
									key={template.title}
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
