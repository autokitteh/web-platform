import React, { useEffect, useMemo, useState } from "react";

import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { ModalName } from "@enums/components";
import {
	HiddenIntegrationsForTemplates,
	IntegrationForTemplates,
	Integrations,
	IntegrationsMap,
} from "@src/enums/components/connection.enum";
import { useModalStore, useProjectStore } from "@src/store";
import { fetchFileContent } from "@src/utilities";

import { Button, ErrorMessage, IconSvg, Input, Loader, Status, Typography } from "@components/atoms";
import { Accordion, Modal } from "@components/molecules";

import { PipeCircleIcon, ReadmeIcon } from "@assets/image/icons";
import "github-markdown-css/github-markdown-light.css";

export const NewProjectModal = () => {
	const { t } = useTranslation("modals", { keyPrefix: "newProject" });
	const [isCreating, setIsCreating] = useState(false);
	const { closeModal } = useModalStore();
	const { projectsList } = useProjectStore();

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

	const validateProjectName = (value: string) => {
		if (projectNamesSet.has(value)) {
			return t("nameTaken");
		}
		if (!new RegExp("^[a-zA-Z_][\\w]*$").test(value)) {
			return t("invalidName");
		}
	};

	const onSubmit = async (data: { projectName: string }) => {
		const { projectName } = data;

		setIsCreating(true);
		setIsCreating(false);
		closeModal(ModalName.templateCreateProject);
	};

	return (
		<Modal className="w-1/2 min-w-550 p-5" hideCloseButton name={ModalName.newProject}>
			<form onSubmit={handleSubmit(onSubmit)}>
				<div className="mb-3 flex items-center justify-end gap-5">
					<h3 className="mb-5 mr-auto text-xl font-bold">{t("title")}</h3>
				</div>
				<Input
					label={t("projectName")}
					placeholder="Enter project name"
					variant="light"
					{...register("projectName", {
						required: t("nameRequired"),
						validate: validateProjectName,
					})}
					isError={!!errors.projectName}
				/>
				{errors.projectName ? (
					<ErrorMessage className="relative mt-0.5">{errors.projectName.message}</ErrorMessage>
				) : null}

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
