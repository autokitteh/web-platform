import React, { useMemo, useState } from "react";

import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { validateEntitiesName } from "@utilities";

import { useProjectActions } from "@hooks";
import { useModalStore, useProjectStore, useToastStore } from "@store";

import { Button, ErrorMessage, Input, Loader } from "@components/atoms";
import { Modal } from "@components/molecules";

export const NewProjectModal = () => {
	const { t } = useTranslation("modals", { keyPrefix: "newProject" });
	const { closeModal } = useModalStore();
	const { projectsList } = useProjectStore();
	const addToast = useToastStore((state) => state.addToast);
	const projectNamesSet = useMemo(() => new Set(projectsList.map((project) => project.name)), [projectsList]);
	const [responseError, setResponseError] = useState("");
	const { handleCreateProject, isCreatingNewProject } = useProjectActions();

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

	const onSubmit = async (data: { projectName: string }) => {
		const { projectName } = data;

		const { error } = await handleCreateProject(projectName);

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
	};

	return (
		<Modal className="w-1/2 min-w-550 p-5" hideCloseButton name={ModalName.newProject}>
			<form onSubmit={handleSubmit(onSubmit)}>
				<h3 className="mb-5 mr-auto text-xl font-bold">{t("title")}</h3>

				<Input
					label={t("projectName")}
					placeholder={t("inputPlaceholder")}
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
				{responseError ? <ErrorMessage className="relative mt-0.5">{responseError}</ErrorMessage> : null}

				<div className="mt-8 flex w-full justify-end gap-2">
					<Button
						ariaLabel={t("cancelButton")}
						className="px-4 py-3 font-semibold hover:bg-gray-1100 hover:text-white"
						onClick={() => closeModal(ModalName.newProject)}
						variant="outline"
					>
						{t("cancelButton")}
					</Button>
					<Button
						ariaLabel={t("createButton")}
						className="bg-gray-1100 px-4 py-3 font-semibold"
						disabled={isCreatingNewProject || !!errors.projectName}
						type="submit"
						variant="filled"
					>
						{isCreatingNewProject ? <Loader className="mr-2" size="sm" /> : null}
						{t("createButton")}
					</Button>
				</div>
			</form>
		</Modal>
	);
};
