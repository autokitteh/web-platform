import React from "react";

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
import { validateEntitiesName } from "@src/utilities";

import { Button, ErrorMessage, IconSvg, Input, Loader, Status, Typography } from "@components/atoms";
import { Accordion, Modal } from "@components/molecules";

import { PipeCircleIcon, ReadmeIcon } from "@assets/image/icons";

export const ProjectTemplateCreateModal = ({
	template,
	readme,
	isReadmeLoading,
	isCreating,
	projectNamesList,
	onSubmit,
	onCancel,
}: CreateProjectModalProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "createProjectWithTemplate" });
	const { assetDirectory, description, integrations, title, category } = template;

	const projectNamesSet = new Set(projectNamesList);

	const defaultProjectName = assetDirectory ? assetDirectory.split("/").pop() || assetDirectory : "";

	const {
		formState: { errors },
		handleSubmit,
		register,
	} = useForm<{ projectName: string }>({
		mode: "onChange",
		defaultValues: {
			projectName: defaultProjectName,
		},
	});

	const handleFormSubmit = async (data: { projectName: string }) => {
		const { projectName } = data;
		if (!assetDirectory || !projectName) return;

		await onSubmit(projectName);
	};

	return (
		<Modal className="w-1/2 min-w-550 p-5" hideCloseButton name={ModalName.templateCreateProject}>
			<form onSubmit={handleSubmit(handleFormSubmit)}>
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
					defaultValue={defaultProjectName}
					label={t("projectName")}
					placeholder={t("projectNameInputPlaceholder")}
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
					{isReadmeLoading ? (
						<div className="flex h-96 items-center justify-center">
							<Loader size="lg" />
						</div>
					) : (
						<div className="markdown-light-theme">
							<Markdown
								className="scrollbar markdown-body h-96 overflow-hidden overflow-y-auto"
								remarkPlugins={[remarkGfm]}
							>
								{readme || t("noReadme") + "\n\n" + t("readmeHelp")}
							</Markdown>
						</div>
					)}
				</Accordion>
				<div className="mt-8 flex w-full justify-end gap-2">
					<Button
						ariaLabel={t("cancelButton")}
						className="px-4 py-3 font-semibold hover:bg-gray-1100 hover:text-white"
						onClick={onCancel}
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
