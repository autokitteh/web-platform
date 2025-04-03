import React, { useMemo, useState } from "react";

import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";

import { ModalName } from "@enums/components";
import { useProjectActions } from "@src/hooks";

import { useModalStore, useProjectStore, useToastStore } from "@store";

import { Button, ErrorMessage, Input, Loader } from "@components/atoms";
import { Modal } from "@components/molecules";

export const DuplicateProjectModal = () => {
	const { t } = useTranslation("modals", { keyPrefix: "duplicateProject" });
	const { projectId } = useParams();
	const { closeModal } = useModalStore();
	const { projectsList } = useProjectStore();
	const [isRenaming, setIsRenaming] = useState(false);
	const { duplicateProject } = useProjectActions();
	const navigate = useNavigate();
	const addToast = useToastStore((state) => state.addToast);

	const { projectNamesSet, projectName } = useMemo(() => {
		const namesSet = new Set(projectsList.map((project) => project.name));
		const name = projectsList.find(({ id }) => id === projectId)?.name;
		return { projectNamesSet: namesSet, projectName: name };
	}, [projectsList, projectId]);

	const {
		formState: { errors },
		handleSubmit,
		register,
		reset,
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
		setIsRenaming(true);
		const { projectName } = data;

		try {
			const { error, newProjectId } = await duplicateProject(projectId!, projectName);
			if (error) {
				addToast({ message: error, type: "error" });

				return;
			}
			navigate(`/projects/${newProjectId}/code`);
			addToast({ message: t("projectSuccessDuplicated"), type: "success" });
		} finally {
			reset();
			setIsRenaming(false);
			closeModal(ModalName.duplicateProject);
		}
	};

	return (
		<Modal hideCloseButton name={ModalName.duplicateProject}>
			<h3 className="mb-5 text-xl font-bold">{t("title", { name: projectName })}</h3>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Input
					label={t("projectName")}
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
						onClick={() => closeModal(ModalName.duplicateProject)}
						variant="outline"
					>
						{t("cancelButton")}
					</Button>

					<Button
						ariaLabel={t("duplicateButton")}
						className="bg-gray-1100 px-4 py-3 font-semibold"
						disabled={isRenaming}
						type="submit"
						variant="filled"
					>
						{isRenaming ? <Loader size="sm" /> : null}
						{t("duplicateButton")}
					</Button>
				</div>
			</form>
		</Modal>
	);
};
