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

import { useModalStore, useToastStore, useCacheStore } from "@store";

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

const directorySchema = z.object({
	name: z
		.string()
		.min(1, "Directory name is required")
		.refine((name) => !hasInvalidCharacters(name), "Directory name contains invalid characters")
		.refine((name) => !name.startsWith("."), "Directory name cannot start with a dot")
		.refine((name) => name.trim() === name, "Directory name cannot have leading or trailing spaces"),
});

type DirectoryFormData = z.infer<typeof directorySchema>;

export const AddDirectoryModal = () => {
	const { projectId } = useParams();
	const { t } = useTranslation(["modals", "buttons", "files", "errors"]);
	const { closeModal } = useModalStore();
	const addToast = useToastStore((state) => state.addToast);
	const { fetchResources } = useCacheStore();
	const { createDirectory } = fileOperations(projectId!);

	const {
		clearErrors,
		formState: { errors },
		handleSubmit,
		register,
		reset,
	} = useForm<DirectoryFormData>({
		defaultValues: {
			name: "",
		},
		resolver: zodResolver(directorySchema),
	});

	useEffect(() => {
		reset({ name: "" });
		clearErrors();
	}, [reset, clearErrors]);

	const onSubmit = async (data: DirectoryFormData) => {
		try {
			const success = await createDirectory(data.name);
			if (!success) {
				addToast({
					message: t("directoryCreationFailed", { name: data.name, ns: "errors" }),
					type: "error",
				});

				LoggerService.error(
					namespaces.projectUICode,
					t("directoryCreationFailedExtended", { name: data.name, projectId, ns: "errors" })
				);
				return;
			}

			await fetchResources(projectId!, true);

			addToast({
				message: t("directoryCreatedSuccessfully", { name: data.name, ns: "files" }),
				type: "success",
			});
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			addToast({
				message: t("directoryCreationFailed", { name: data.name, ns: "errors" }),
				type: "error",
			});

			LoggerService.error(
				namespaces.projectUICode,
				t("directoryCreationFailedExtended", { name: data.name, projectId, ns: "errors" }) + `: ${errorMessage}`
			);
		}
		clearErrors();
		closeModal(ModalName.addDirectory);
		reset({ name: "" });
	};

	return (
		<Modal className="w-550" name={ModalName.addDirectory}>
			<div className="mx-6">
				<h3 className="mb-5 text-xl font-bold">{t("addDirectory.title", { ns: "modals" })}</h3>

				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="relative w-full">
						<Input
							{...register("name")}
							aria-label={t("addDirectory.ariaLabelNewDirectory", { ns: "modals" })}
							isError={!!errors.name}
							isRequired
							label={t("addDirectory.placeholderName", { ns: "modals" })}
							variant="light"
						/>

						<ErrorMessage className="relative">{errors.name?.message as string}</ErrorMessage>
					</div>

					<Button className="mt-3 justify-center rounded-lg py-2.5 font-bold" type="submit" variant="filled">
						{t("create", { ns: "buttons" })}
					</Button>
				</form>
			</div>
		</Modal>
	);
};
