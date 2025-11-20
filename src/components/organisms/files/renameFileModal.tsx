import React, { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { z } from "zod";

import { namespaces } from "@constants";
import { ModalName } from "@enums/components";
import { LoggerService } from "@services";
import { fileOperations } from "@src/factories";

import { useCacheStore, useModalStore, useToastStore } from "@store";

import { Button, ErrorMessage, Input } from "@components/atoms";
import { Modal } from "@components/molecules";

const renameFileSchema = z.object({
	name: z.string().min(1, "File name is required"),
});

type RenameFileFormData = z.infer<typeof renameFileSchema>;

export const RenameFileModal = () => {
	const { projectId } = useParams();
	const { t } = useTranslation(["errors", "buttons", "modals", "files"]);
	const { closeModal, getModalData } = useModalStore();
	const addToast = useToastStore((state) => state.addToast);
	const { fetchResources } = useCacheStore();
	const { renameFile } = fileOperations(projectId!);

	const oldFileName = getModalData<string>(ModalName.renameFile) || "";

	const {
		clearErrors,
		formState: { errors },
		handleSubmit,
		register,
		reset,
		setValue,
	} = useForm<RenameFileFormData>({
		defaultValues: {
			name: oldFileName,
		},
		resolver: zodResolver(renameFileSchema),
	});

	useEffect(() => {
		if (oldFileName) {
			setValue("name", oldFileName);
		}
		clearErrors();
	}, [oldFileName, setValue, clearErrors]);

	const onSubmit = async (data: RenameFileFormData) => {
		const newFileName = data.name;

		if (newFileName === oldFileName) {
			closeModal(ModalName.renameFile);
			return;
		}

		try {
			const success = await renameFile(oldFileName, newFileName);
			if (!success) {
				addToast({
					message: t("fileRenameFailed", { fileName: oldFileName }),
					type: "error",
				});

				LoggerService.error(
					namespaces.projectUICode,
					t("fileRenameFailedExtended", {
						fileName: oldFileName,
						projectId,
						error: t("fileRenameFailed", { fileName: oldFileName }),
					})
				);
				return;
			}

			await fetchResources(projectId!, true);

			addToast({
				message: t("fileRenamedSuccessfully", { ns: "files" }),
				type: "success",
			});
		} catch (error) {
			addToast({
				message: t("fileRenameFailed", { fileName: oldFileName }),
				type: "error",
			});

			LoggerService.error(
				namespaces.projectUICode,
				t("fileRenameFailedExtended", {
					fileName: oldFileName,
					projectId,
					error: error instanceof Error ? error.message : String(error),
				})
			);
		}
		clearErrors();
		closeModal(ModalName.renameFile);
		reset({ name: "" });
	};

	return (
		<Modal className="w-550" name={ModalName.renameFile}>
			<div className="mx-6">
				<h3 className="mb-5 text-xl font-bold">{t("renameFile.title", { ns: "modals" })}</h3>

				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="relative w-full">
						<Input
							{...register("name")}
							aria-label={t("renameFile.ariaLabelFileName", { ns: "modals" })}
							isError={!!errors.name}
							isRequired
							label={t("renameFile.placeholderName", { ns: "modals" })}
							variant="light"
						/>

						<ErrorMessage className="relative">{errors.name?.message as string}</ErrorMessage>
					</div>

					<Button className="mt-3 justify-center rounded-lg py-2.5 font-bold" type="submit" variant="filled">
						{t("rename", { ns: "buttons" })}
					</Button>
				</form>
			</div>
		</Modal>
	);
};
