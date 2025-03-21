import React, { useState, useEffect } from "react";

import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { ModalName } from "@enums/components";
import { useProjectActions } from "@src/hooks";
import { useModalStore, useToastStore, useProjectStore } from "@src/store";

import { Button, ErrorMessage, Input, Loader } from "@components/atoms";
import { Modal } from "@components/molecules";

export const ProjectExportModal = () => {
	const { t } = useTranslation("modals", { keyPrefix: "projectExport" });
	const [isExporting, setIsExporting] = useState(false);
	const [currentProjectName, setCurrentProjectName] = useState<string>();
	const { downloadProjectExport } = useProjectActions();
	const { getProject } = useProjectStore();
	const { closeModal } = useModalStore();
	const { projectId } = useParams();
	const addToast = useToastStore((state) => state.addToast);

	const {
		formState: { errors },
		handleSubmit,
		register,
		setValue,
		watch,
	} = useForm<{ projectName: string }>({
		mode: "onChange",
		defaultValues: {
			projectName: "",
		},
	});

	useEffect(() => {
		const fetchProject = async () => {
			if (!projectId) return;
			const { data: project, error: getProjectError } = await getProject(projectId);

			if (getProjectError) {
				addToast({
					message: t("errorGetProject"),
					type: "error",
				});
				return;
			}
			setCurrentProjectName(project?.name);
			setValue("projectName", project?.name || "");
		};

		fetchProject();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	const onSubmit = async (data: { projectName: string }) => {
		setIsExporting(true);
		const { projectName } = data;

		const { error } = await downloadProjectExport(projectId!, projectName);
		if (error) {
			addToast({
				message: t("errorExportingProject"),
				type: "error",
			});
		}
		if (!error) {
			addToast({
				message: t("successfullyExported"),
				type: "success",
			});
		}
		setIsExporting(false);
		closeModal(ModalName.projectExport);
	};

	return (
		<Modal hideCloseButton name={ModalName.projectExport}>
			<form onSubmit={handleSubmit(onSubmit)}>
				<div className="mx-6">
					<h3 className="mb-5 text-xl font-bold">{t("title", { name: currentProjectName })}</h3>

					<Input
						label={t("renameProjectForExport")}
						value={watch("projectName")}
						variant="light"
						{...register("projectName", {
							required: t("nameRequired"),
							validate: (value) => value.trim().length > 0 || t("nameRequired"),
						})}
						isError={!!errors.projectName}
					/>
					{errors.projectName ? (
						<ErrorMessage className="relative mt-0.5">{errors.projectName.message}</ErrorMessage>
					) : null}
				</div>

				<div className="mt-8 flex w-full justify-end gap-2">
					<Button
						ariaLabel={t("cancelButton")}
						className="px-4 py-3 font-semibold hover:bg-gray-1100 hover:text-white"
						disabled={isExporting}
						onClick={() => closeModal(ModalName.projectExport)}
						variant="outline"
					>
						{t("cancelButton")}
					</Button>

					<Button
						ariaLabel={t("exportButton")}
						className="bg-gray-1100 px-4 py-3 font-semibold"
						disabled={isExporting}
						variant="filled"
					>
						{isExporting ? <Loader size="sm" /> : null}
						{t("exportButton")}
					</Button>
				</div>
			</form>
		</Modal>
	);
};
