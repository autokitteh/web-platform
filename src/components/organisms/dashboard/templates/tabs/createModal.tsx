import React, { useEffect, useMemo, useState } from "react";

import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { ModalName } from "@enums/components";
import { CreateProjectModalProps } from "@interfaces/components";
import {
	HiddenIntegrationsForTemplates,
	IntegrationForTemplates,
	Integrations,
	IntegrationsMap,
} from "@src/enums/components/connection.enum";
import { useCreateProjectFromTemplate } from "@src/hooks";
import { useModalStore, useProjectStore, useTemplatesStore } from "@src/store";
import { validateEntitiesName } from "@src/utilities";

import { Button, ErrorMessage, IconSvg, Input, Loader, Status, Typography } from "@components/atoms";
import { Accordion, Modal } from "@components/molecules";

import { PipeCircleIcon, ReadmeIcon } from "@assets/image/icons";

import "github-markdown-css/github-markdown-light.css";

export const ProjectTemplateCreateModal = ({ cardTemplate, category }: CreateProjectModalProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "createProjectWithTemplate" });
	const [isCreating, setIsCreating] = useState(false);
	const [readme, setReadme] = useState("");
	const { assetDirectory, description, integrations, title } = cardTemplate;
	const { closeModal } = useModalStore();
	const { createProjectFromAsset } = useCreateProjectFromTemplate();
	const { projectsList } = useProjectStore();
	const { getFilesForTemplate } = useTemplatesStore();

	const projectNamesSet = useMemo(() => new Set(projectsList.map((project) => project.name)), [projectsList]);

	const {
		formState: { errors },
		handleSubmit,
		register,
	} = useForm<{ projectName: string }>({
		mode: "onChange",
		defaultValues: {
			projectName: "",
		},
	});

	const fetchManifestData = async () => {
		if (!assetDirectory) return;
		const content = await getFilesForTemplate(assetDirectory);

		if (!content["README.md"]) {
			setReadme("");

			return;
		}

		const readmeContent = content["README.md"];
		const cleanedReadme = readmeContent.replace(/---[\s\S]*?---\n/, "");
		setReadme(cleanedReadme);
	};

	useEffect(() => {
		fetchManifestData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [assetDirectory]);

	const onSubmit = async (data: { projectName: string }) => {
		const { projectName } = data;
		if (!assetDirectory || !projectName) return;

		setIsCreating(true);
		await createProjectFromAsset(assetDirectory, projectName);
		setIsCreating(false);
		closeModal(ModalName.templateCreateProject);
	};

	return (
		<Modal className="w-1/2 min-w-550 p-5" hideCloseButton name={ModalName.templateCreateProject}>
			<form onSubmit={handleSubmit(onSubmit)}>
				<div className="mb-3 flex items-center justify-end gap-5">
					<h3 className="mb-5 mr-auto text-xl font-bold">{t("title", { name: title })}</h3>
					<Status>{category}</Status>
					<div className="flex gap-3">
						{integrations.map((integration, index) => {
							const enrichedIntegration =
								IntegrationsMap[integration as keyof typeof Integrations] ||
								HiddenIntegrationsForTemplates[integration as keyof typeof IntegrationForTemplates] ||
								{};

							const { icon, label } = enrichedIntegration;

							return (
								<div
									className="relative flex size-8 items-center justify-center rounded-full bg-gray-400 p-1"
									key={index}
									title={label}
								>
									<IconSvg className="z-10 rounded-full p-1" size="xl" src={icon} />
									{index < integrations.length - 1 ? (
										<PipeCircleIcon className="absolute -right-4 top-1/2 -translate-y-1/2 fill-gray-400" />
									) : null}
								</div>
							);
						})}
					</div>
				</div>
				<Input
					label={t("projectName")}
					placeholder="Enter project name"
					variant="light"
					{...register("projectName", {
						required: t("nameRequired"),
						validate: (value) => validateEntitiesName(value, projectNamesSet) || true,
					})}
					isError={!!errors.projectName}
				/>
				{errors.projectName ? (
					<ErrorMessage className="relative mt-0.5">{errors.projectName.message}</ErrorMessage>
				) : null}
				<Accordion className="mt-6" classNameButton="text-black" title={t("moreInformaton")}>
					<Typography className="mt-1" element="h4" size="medium">
						{t("description", { description })}
					</Typography>
					<div className="mt-4 flex items-center gap-1 text-base uppercase">
						<ReadmeIcon className="size-4" /> {t("readme")}
					</div>
					<Markdown
						className="scrollbar markdown-body h-96 overflow-hidden overflow-y-auto"
						remarkPlugins={[remarkGfm]}
					>
						{readme}
					</Markdown>
				</Accordion>
				<div className="mt-8 flex w-full justify-end gap-2">
					<Button
						ariaLabel={t("cancelButton")}
						className="px-4 py-3 font-semibold hover:bg-gray-1100 hover:text-white"
						onClick={() => closeModal(ModalName.templateCreateProject)}
						variant="outline"
					>
						{t("cancelButton")}
					</Button>
					<Button
						ariaLabel={t("createButton")}
						className="bg-gray-1100 px-4 py-3 font-semibold"
						disabled={isCreating || !!errors.projectName}
						type="submit"
						variant="filled"
					>
						{isCreating ? <Loader className="mr-2" size="sm" /> : null}
						{t("createButton")}
					</Button>
				</div>
			</form>
		</Modal>
	);
};
