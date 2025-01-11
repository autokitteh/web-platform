import React, { useMemo } from "react";

import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { ModalName } from "@enums/components";
import { useProjectActions } from "@src/hooks";
import { useModalStore, useProjectStore } from "@src/store";

import { Button, ErrorMessage, Input, Loader } from "@components/atoms";
import { Modal } from "@components/molecules";

export const ImportProjectModal = () => {
	const { t } = useTranslation("modals", { keyPrefix: "newProject" });
	const { closeModal, modals: modalState } = useModalStore();
	const { projectsList } = useProjectStore();
	const projectNamesSet = useMemo(() => new Set(projectsList.map((project) => project.name)), [projectsList]);
	const { handleImportFile, isCreatingNewProject, pendingFile } = useProjectActions();
	const navigate = useNavigate();
	if (!pendingFile && modalState[ModalName.importProject]) navigate("/");

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

		await handleImportFile(pendingFile!, projectName);
		setValue("projectName", "");
	};

	return (
		<Modal className="w-1/2 min-w-550 p-5" hideCloseButton name={ModalName.importProject}>
			<form onSubmit={handleSubmit(onSubmit)}>
				<h3 className="text-xl font-bold">{t("projectAlreadyExist")}</h3>
				<p className="mb-5 mt-1 text-base font-medium">{t("projectAnotherName")}</p>

				<Input
					label={t("projectName")}
					placeholder={t("inputPlaceholder")}
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
						onClick={() => closeModal(ModalName.importProject)}
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
