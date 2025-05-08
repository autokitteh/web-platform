import React, { useCallback, useState } from "react";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useTranslation } from "react-i18next";

import { defaultPopoverSelect } from "@constants";
import { integrationTypes } from "@constants/lists";
import { ModalName } from "@src/enums/components";
import { useTemplatesFiltering } from "@src/hooks";
import { TemplateMetadata } from "@src/interfaces/store";
import { useModalStore, useTemplatesStore } from "@src/store";
import { cn } from "@src/utilities";

import { Frame, IconSvg, Loader, Typography } from "@components/atoms";
import { LoadingOverlay } from "@components/molecules";
import { MultiplePopoverSelect } from "@components/molecules/popoverSelect";
import {
	ProjectTemplateCard,
	ProjectTemplateCreateModalContainer,
} from "@components/organisms/dashboard/templates/tabs";

import { StartTemplateIcon } from "@assets/image/icons";

export const TemplatesCatalog = ({ fullScreen }: { fullScreen?: boolean }) => {
	const { t } = useTranslation("dashboard", { keyPrefix: "templates" });
	const [selectedTemplate, setSelectedTemplate] = useState<TemplateMetadata>();

	const { openModal } = useModalStore();
	const [parent] = useAutoAnimate();
	const { error, isLoading, sortedCategories: categories } = useTemplatesStore();
	const [selectedCategories, setSelectedCategories] = useState<string[]>([defaultPopoverSelect]);
	const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([defaultPopoverSelect]);
	const { filteredTemplates, popoverItems } = useTemplatesFiltering(
		categories,
		selectedCategories,
		selectedIntegrations,
		integrationTypes
	);

	const handleCardCreateClick = useCallback(
		(template: TemplateMetadata) => {
			setSelectedTemplate(template);
			openModal(ModalName.templateCreateProject);
		},
		[openModal]
	);

	const frameClass = cn("h-full rounded-none border-l border-l-gray-750 bg-gray-1250", {
		"mt-1.5 rounded-2xl": fullScreen,
	});

	return (
		<Frame className={frameClass}>
			<LoadingOverlay isLoading={isLoading} />
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
								ariaLabel={t("categories")}
								defaultSelectedItems={[defaultPopoverSelect]}
								emptyListMessage={t("noCategoriesFound")}
								items={popoverItems.categoryItems}
								label={t("categories")}
								onItemsSelected={setSelectedCategories}
							/>
							<MultiplePopoverSelect
								ariaLabel={t("integrations")}
								defaultSelectedItems={[defaultPopoverSelect]}
								emptyListMessage={t("noIntegrationsFound")}
								items={popoverItems.integrationItems}
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
