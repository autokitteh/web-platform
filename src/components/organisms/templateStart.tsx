import React, { useCallback, useMemo } from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@src/enums/components";
import { useTemplateCreation } from "@src/hooks/useTemplateCreation";
import { useModalStore, useTemplatesStore } from "@src/store";

import { Button, IconButton, Typography, Loader } from "@components/atoms";
import { TemplateIntegrationsIcons } from "@components/molecules";
import { ProjectTemplateCreateModalContainer } from "@components/organisms/dashboard/templates/tabs";

import { CirclePlayIcon } from "@assets/image/icons";

export const TemplateStart = ({ assetDir }: { assetDir: string }) => {
	const { t } = useTranslation("templates", { keyPrefix: "landingPage" });
	const { sortedCategories } = useTemplatesStore();
	const { createTemplate, checkTemplateStatus, isCreating } = useTemplateCreation();
	const { openModal } = useModalStore();

	const selectedTemplate = useMemo(() => {
		if (!sortedCategories) return undefined;

		for (const category of sortedCategories) {
			const template = category.templates.find((template) => template.assetDirectory === assetDir);
			if (template) return template;
		}
		return undefined;
	}, [sortedCategories, assetDir]);

	const templateStatus = useMemo(
		() => (selectedTemplate ? checkTemplateStatus(selectedTemplate) : { canCreate: false }),
		[selectedTemplate, checkTemplateStatus]
	);

	const handleCreateClick = useCallback(() => {
		if (!selectedTemplate) return;

		if (templateStatus.alreadyExists) {
			openModal(ModalName.templateCreateProject, { template: selectedTemplate });
			return;
		}

		createTemplate(selectedTemplate.assetDirectory);
	}, [selectedTemplate, templateStatus, createTemplate, openModal]);

	const handleOpenModal = (video: string) => {
		openModal(ModalName.welcomePage, { video });
	};

	return (
		<div className="mx-auto max-w-7xl py-12">
			<div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
				<div className="relative flex flex-col rounded-3xl border-2 border-gray-800 bg-gradient-to-b from-gray-900/40 to-gray-900/20 p-10 shadow-lg">
					<div className="absolute -left-1 -top-1 size-20 rounded-tl-3xl border-l-4 border-t-4 border-green-800 opacity-60" />
					<div className="space-y-6">
						<TemplateIntegrationsIcons
							iconClassName="bg-white/90 hover:bg-white transition-colors duration-200"
							size="2xl"
							template={selectedTemplate}
							wrapperClassName="shadow-[0_0_15px_-3px_rgba(188,248,112,0.5)] hover:shadow-[0_0_20px_-3px_rgba(188,248,112,0.7)]
									  transition-shadow duration-200"
						/>

						<div className="space-y-6">
							<Typography
								className="text-4xl font-bold leading-tight tracking-tight text-white shadow-sm backdrop-blur-sm"
								element="h1"
							>
								{selectedTemplate?.title}
							</Typography>

							<Typography className="text-xl leading-relaxed text-gray-300/90" element="h2">
								{selectedTemplate?.description}
							</Typography>
						</div>
					</div>

					<div className="mt-auto">
						<Button
							ariaLabel={t("buttons.start")}
							className="group flex w-full items-center justify-center gap-4 rounded-full bg-gradient-to-r from-green-800 to-green-800/80 px-10 py-4 shadow-[0_0_15px_-5px_rgba(188,248,112,0.2)] transition-all duration-300 ease-in-out hover:translate-y-[-2px] hover:from-green-800/90 hover:to-green-800/70 hover:shadow-[0_0_20px_-5px_rgba(188,248,112,0.3)]"
							onClick={handleCreateClick}
						>
							<div className="mr-2">{isCreating ? <Loader firstColor="dark-gray" /> : null}</div>

							<span className="text-2xl font-bold text-black group-hover:text-white">
								{t("buttons.start")}
							</span>
						</Button>
					</div>
				</div>

				<div className="flex flex-col space-y-4">
					<div className="group relative aspect-video w-full overflow-hidden rounded-3xl border-2 border-gray-800 bg-gray-900 shadow-[0_0_30px_-10px_rgba(0,0,0,0.5)]">
						<div className="absolute inset-0 bg-[url('image/pages/intro/startingProject.jpg')] bg-cover bg-center bg-no-repeat transition-all duration-500 group-hover:scale-105 group-hover:brightness-50" />

						<div className="absolute inset-0 flex items-center justify-center">
							<IconButton
								className="transition-all duration-300 hover:scale-110"
								onClick={() =>
									handleOpenModal("https://www.youtube.com/embed/60DQ9Py4LqU?si=tat7TeACzguZKDSv")
								}
							>
								<div className="rounded-full bg-black/75 p-6 backdrop-blur-sm transition-all duration-300 group-hover:bg-green-800/90">
									<CirclePlayIcon className="size-14 fill-white opacity-90 group-hover:opacity-100" />
								</div>
							</IconButton>
						</div>
					</div>
					<div className="rounded-2xl border-2 border-gray-800/50 bg-gray-900/30 p-8 backdrop-blur-sm">
						<Typography className="text-lg leading-relaxed text-gray-400">{t("videoSubtitle")}</Typography>
					</div>
				</div>
			</div>

			{selectedTemplate ? <ProjectTemplateCreateModalContainer template={selectedTemplate} /> : null}
		</div>
	);
};
