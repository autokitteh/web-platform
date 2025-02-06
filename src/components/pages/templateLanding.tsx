import React, { useEffect, useCallback, useMemo } from "react";

import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import { howToBuildAutomation, whatIsAutoKitteh } from "@src/constants";
import { ModalName } from "@src/enums/components";
import {
	HiddenIntegrationsForTemplates,
	IntegrationForTemplates,
	Integrations,
	IntegrationsMap,
} from "@src/enums/components/connection.enum";
import { useCreateProjectFromTemplate } from "@src/hooks";
import { TemplateMetadata } from "@src/interfaces/store";
import { useModalStore, useTemplatesStore, useProjectStore } from "@src/store";

import { Button, IconButton, IconSvg, Spinner, Typography, Frame, Loader } from "@components/atoms";
import { WelcomeVideoModal } from "@components/organisms/dashboard";
import { ProjectTemplateCreateModal } from "@components/organisms/dashboard/templates/tabs";

import { ProjectsIcon } from "@assets/image";
import { CirclePlayIcon, PipeCircleDarkIcon } from "@assets/image/icons";

export const TemplateLanding = () => {
	const { t: tWelcome } = useTranslation("dashboard", { keyPrefix: "topbar" });
	const { t } = useTranslation("dashboard", { keyPrefix: "welcome" });
	const { openModal } = useModalStore();
	const { createProjectFromAsset, isCreating } = useCreateProjectFromTemplate();
	const { fetchTemplates, sortedCategories, isLoading } = useTemplatesStore();
	const { projectsList } = useProjectStore();
	const [searchParams] = useSearchParams();
	const assetDir = searchParams.get("assetDirectory");

	const projectNamesSet = useMemo(() => new Set(projectsList.map((project) => project.name)), [projectsList]);
	const selectedTemplate = useMemo(() => {
		return sortedCategories?.reduce<TemplateMetadata | undefined>((found, category) => {
			return found || category.templates.find((template) => template.assetDirectory === assetDir);
		}, undefined);
	}, [sortedCategories, assetDir]);

	useEffect(() => {
		fetchTemplates();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleCreateClick = useCallback(() => {
		if (!selectedTemplate?.assetDirectory) return;

		if (projectNamesSet.has(selectedTemplate.assetDirectory)) {
			openModal(ModalName.templateCreateProject);
			return;
		}
		createProjectFromAsset(selectedTemplate.assetDirectory);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedTemplate?.assetDirectory]);

	const handleOpenModal = (video: string) => {
		openModal(ModalName.welcomePage, { video });
	};

	return (
		<Frame className="mt-1.5 h-full bg-gray-1100">
			<Typography
				className="mb-8 w-full text-center font-averta text-2xl font-semibold md:mb-0 md:text-left md:text-2xl"
				element="h1"
			>
				{tWelcome("welcome")}
			</Typography>
			<div className="flex flex-col items-center gap-3 border-b border-gray-950 pb-6 font-averta text-white">
				<div className="flex h-40 w-full flex-col md:w-96">
					<div className="flex w-full flex-1 items-center justify-center rounded-2xl border border-gray-750 bg-[url('image/pages/intro/main.jpg')] bg-cover bg-top bg-no-repeat">
						<IconButton
							className="group size-16 overflow-hidden rounded-full bg-black/75 shadow-sm shadow-green-800 hover:bg-black hover:shadow-none focus:scale-90"
							onClick={() => handleOpenModal("https://www.youtube.com/embed/BkUvIJc_kms")}
						>
							<CirclePlayIcon className="rounded-full fill-white transition group-hover:opacity-100" />
						</IconButton>
					</div>
				</div>
				<div className="flex min-h-14 flex-col justify-center font-averta">
					{isLoading || !assetDir ? (
						<Loader />
					) : (
						<>
							<div className="mx-auto flex gap-3">
								{selectedTemplate?.integrations.map((integration, index) => {
									const enrichedIntegration =
										IntegrationsMap[integration as keyof typeof Integrations] ||
										HiddenIntegrationsForTemplates[
											integration as keyof typeof IntegrationForTemplates
										] ||
										{};

									const { icon, label } = enrichedIntegration;

									return (
										<div
											className="relative flex size-8 items-center justify-center rounded-full bg-gray-1400 p-1"
											key={index}
											title={label}
										>
											<IconSvg className="z-10 rounded-full p-1" size="xl" src={icon} />
											{index < selectedTemplate.integrations.length - 1 ? (
												<PipeCircleDarkIcon className="absolute -right-4 top-1/2 -translate-y-1/2 fill-gray-500" />
											) : null}
										</div>
									);
								})}
							</div>
							<Typography className="text-center text-xl font-bold" element="h2">
								{selectedTemplate?.title}
							</Typography>

							<Typography className="text-center text-base font-bold text-green-800" element="h3">
								{selectedTemplate?.description}
							</Typography>
							<Button
								ariaLabel={t("cards.main.meowWorld")}
								className="mx-auto mt-2 w-52 justify-center gap-3 rounded-full bg-green-800 py-2 font-averta text-2xl font-bold leading-tight hover:bg-green-200"
								onClick={handleCreateClick}
							>
								<IconSvg size="lg" src={!isCreating ? ProjectsIcon : Spinner} />
								{t("cards.main.meowWorld")}
							</Button>
						</>
					)}
				</div>
			</div>
			<div className="mt-8 flex flex-wrap justify-center gap-5 font-averta">
				<div>
					<Typography className="text-3xl font-bold" element="h2">
						{t("whatIsAutoKitteh")}
					</Typography>
					<ol className="mt-4 grid gap-1">
						{whatIsAutoKitteh.map((item, index) => (
							<li className="text-base" key={index}>
								{item}
							</li>
						))}
					</ol>
				</div>
				<div>
					<Typography className="text-3xl font-bold" element="h2">
						{t("howToBuildAnAutomation")}
					</Typography>
					<ol className="mt-4 grid gap-1">
						{howToBuildAutomation.map((item, index) => (
							<li className="text-base" key={index}>
								{item}
							</li>
						))}
					</ol>
					<Button
						className="p-0 text-base text-green-800 hover:bg-transparent"
						onClick={() => handleOpenModal("https://www.youtube.com/embed/BkUvIJc_kms")}
						variant="light"
					>
						{t("tutorialVideo")}
					</Button>
				</div>
			</div>

			<WelcomeVideoModal />
			{selectedTemplate ? (
				<ProjectTemplateCreateModal cardTemplate={selectedTemplate} category={selectedTemplate.category} />
			) : null}
		</Frame>
	);
};
