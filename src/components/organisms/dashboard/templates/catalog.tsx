import React, { useCallback, useState } from "react";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useTranslation } from "react-i18next";

import { defaultSelectedMultipleSelect } from "@constants";
import { integrationTypes } from "@constants/lists";
import { ModalName } from "@src/enums/components";
import { useTemplatesFiltering } from "@src/hooks";
import { TemplateMetadata } from "@src/interfaces/store";
import { useModalStore, useSharedBetweenProjectsStore, useTemplatesStore } from "@src/store";
import { cn } from "@src/utilities";

import { Frame, IconButton, IconSvg, Loader, Typography } from "@components/atoms";
import {
	ProjectTemplateCard,
	MultiplePopoverSelect,
	ProjectTemplateCreateModalContainer,
} from "@components/organisms/dashboard/templates/tabs";

import { Close, StartTemplateIcon } from "@assets/image/icons";

export const TemplatesCatalog = ({ fullScreen }: { fullScreen?: boolean }) => {
	const { t } = useTranslation("dashboard", { keyPrefix: "templates" });
	const [selectedTemplate, setSelectedTemplate] = useState<TemplateMetadata>();
	const [selectedCategories, setSelectedCategories] = useState<string[]>([defaultSelectedMultipleSelect]);
	const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([defaultSelectedMultipleSelect]);

	const { openModal } = useModalStore();
	const [parent] = useAutoAnimate();
	const { error, isLoading, sortedCategories: categories } = useTemplatesStore();
	const { filteredTemplates, popoverItems } = useTemplatesFiltering(
		categories,
		selectedCategories,
		selectedIntegrations,
		integrationTypes
	);
	const { setFullScreenDashboard } = useSharedBetweenProjectsStore();

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
			<Typography
				className="mb-7 flex w-full select-none items-center gap-3 font-averta text-3xl font-semibold"
				element="h2"
			>
				<IconSvg aria-hidden={true} className="size-6 fill-white" src={StartTemplateIcon} />
				{t("title")}
			</Typography>
			<IconButton
				className="group absolute right-4 top-4 ml-auto size-6 bg-gray-1100 p-0 hover:bg-gray-1050"
				onClick={() => setFullScreenDashboard(true)}
			>
				<Close className="size-3 fill-gray-500 transition group-hover:fill-white" />
			</IconButton>
			<div className="flex h-full flex-1 flex-col">
				{error ? <div className="mb-8 text-center text-xl text-error">{error}</div> : null}
				{isLoading ? (
					<Loader isCenter />
				) : (
					<>
						<div className="grid grid-cols-2 gap-4">
							<MultiplePopoverSelect
								ariaLabel={t("categories")}
								defaultSelectedItems={[defaultSelectedMultipleSelect]}
								emptyListMessage={t("noCategoriesFound")}
								items={popoverItems.categoryItems}
								label={t("categories")}
								onItemsSelected={setSelectedCategories}
							/>
							<MultiplePopoverSelect
								ariaLabel={t("integrations")}
								defaultSelectedItems={[defaultSelectedMultipleSelect]}
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
