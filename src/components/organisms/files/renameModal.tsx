import React, { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { z } from "zod";

import { ModalName } from "@enums/components";
import { LoggerService } from "@services";
import { namespaces } from "@src/constants";
import { fileOperations } from "@src/factories";

import { useModalStore, useToastStore } from "@store";

import { Button, ErrorMessage, Input } from "@components/atoms";
import { Modal } from "@components/molecules";

const hasInvalidCharacters = (name: string): boolean => {
	const invalidChars = /[<>:"/\\|?*]/;
	if (invalidChars.test(name)) return true;

	for (let i = 0; i < name.length; i++) {
		const code = name.charCodeAt(i);
		if (code < 32) return true;
	}
	return false;
};

const renameSchema = z.object({
	name: z
		.string()
		.min(1, "Name is required")
		.refine((name) => !hasInvalidCharacters(name), "Name contains invalid characters")
		.refine((name) => name.trim() === name, "Name cannot have leading or trailing spaces"),
});

type RenameFormData = z.infer<typeof renameSchema>;

interface RenameModalData {
	oldName: string;
	isDirectory: boolean;
}

export const RenameModal = () => {
	const { projectId } = useParams();
	const { t } = useTranslation(["modals", "buttons"]);
	const { closeModal, getModalData } = useModalStore();
	const addToast = useToastStore((state) => state.addToast);
	const { renameFile, renameDirectory } = fileOperations(projectId!);

	const modalData = getModalData<RenameModalData>(ModalName.renameFileOrDirectory);
	const oldName = modalData?.oldName || "";
	const isDirectory = modalData?.isDirectory || false;

	const {
		clearErrors,
		formState: { errors },
		handleSubmit,
		register,
		reset,
		setValue,
	} = useForm<RenameFormData>({
		defaultValues: {
			name: oldName,
		},
		resolver: zodResolver(renameSchema),
	});

	useEffect(() => {
		setValue("name", oldName);
		clearErrors();
	}, [oldName, setValue, clearErrors]);

	const onSubmit = async (data: RenameFormData) => {
		if (data.name === oldName) {
			closeModal(ModalName.renameFileOrDirectory);
			return;
		}

		try {
			let success: boolean | undefined;

			if (isDirectory) {
				success = await renameDirectory(oldName, data.name);
			} else {
				success = await renameFile(oldName, data.name);
			}

			if (!success) {
				addToast({
					message: `Failed to rename ${isDirectory ? "directory" : "file"} "${oldName}"`,
					type: "error",
				});

				LoggerService.error(
					namespaces.projectUICode,
					`Failed to rename ${isDirectory ? "directory" : "file"} "${oldName}" to "${data.name}" in project ${projectId}`
				);
				return;
			}

			addToast({
				message: `${isDirectory ? "Directory" : "File"} renamed successfully`,
				type: "success",
			});
		} catch (error) {
			addToast({
				message: `Failed to rename ${isDirectory ? "directory" : "file"} "${oldName}"`,
				type: "error",
			});

			LoggerService.error(namespaces.projectUICode, `Failed to rename: ${error}`);
		}
		clearErrors();
		closeModal(ModalName.renameFileOrDirectory);
		reset({ name: "" });
	};

	const typeLabel = isDirectory
		? t("renameFileOrDirectory.directory", { ns: "modals" })
		: t("renameFileOrDirectory.file", { ns: "modals" });

	return (
		<Modal className="w-550" name={ModalName.renameFileOrDirectory}>
			<div className="mx-6">
				<h3 className="mb-5 text-xl font-bold">
					{t("renameFileOrDirectory.title", { ns: "modals", type: typeLabel })}
				</h3>

				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="relative w-full">
						<Input
							{...register("name")}
							aria-label={t("renameFileOrDirectory.ariaLabelNewName", { ns: "modals" })}
							isError={!!errors.name}
							isRequired
							label={t("renameFileOrDirectory.placeholderName", { ns: "modals" })}
							variant="light"
						/>

						<ErrorMessage className="relative">{errors.name?.message as string}</ErrorMessage>
					</div>

					<Button className="mt-3 justify-center rounded-lg py-2.5 font-bold" type="submit" variant="filled">
						{t("save", { ns: "buttons" })}
					</Button>
				</form>
			</div>
		</Modal>
	);
};
