import React, { useMemo, useState } from "react";

import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { ModalName, SidebarHrefMenu } from "@enums/components";
import { defaultProjectFile } from "@src/constants";
import { useModalStore, useProjectStore, useToastStore } from "@src/store";

import { Button, ErrorMessage, Input, Loader } from "@components/atoms";
import { Modal } from "@components/molecules";

export const NewProjectModal = () => {
	const { t } = useTranslation("modals", { keyPrefix: "newProject" });
	const [isCreating, setIsCreating] = useState(false);
	const { closeModal } = useModalStore();
	const { projectsList } = useProjectStore();
	const addToast = useToastStore((state) => state.addToast);
	const { createProject } = useProjectStore();
	const projectNamesSet = useMemo(() => new Set(projectsList.map((project) => project.name)), [projectsList]);
	const navigate = useNavigate();
	const [responseError, setResponseError] = useState("");

	const {
		formState: { errors },
		handleSubmit,
		register,
		setValue,
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
		const { data: newProjectResponse, error } = await createProject(projectName, true);
		setIsCreating(false);

		if (error) {
			addToast({
				message: t("errorCreatingProject"),
				type: "error",
			});

			setResponseError(t("errorCreatingProject"));

			return;
		}
		closeModal(ModalName.newProject);
		setValue("projectName", "");
		navigate(`/${SidebarHrefMenu.projects}/${newProjectResponse?.projectId}/code`, {
			state: { fileToOpen: defaultProjectFile },
		});
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
				{responseError ? <ErrorMessage className="relative mt-0.5">{responseError}</ErrorMessage> : null}

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
