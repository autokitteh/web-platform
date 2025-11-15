import React, { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { defalutFileExtension, namespaces } from "@constants";
import { ModalName } from "@enums/components";
import { LoggerService } from "@services";
import { fileOperations } from "@src/factories";
import { codeFilesSchema } from "@validations";

import { useFileStore, useModalStore, useToastStore } from "@store";

import { Button, ErrorMessage, Input } from "@components/atoms";
import { Modal } from "@components/molecules";

export const AddFileModal = () => {
	const { projectId } = useParams();
	const { t } = useTranslation(["errors", "buttons", "modals"]);
	const { t: tTabsEditor } = useTranslation("tabs", { keyPrefix: "editor" });
	const { closeModal } = useModalStore();
	const addToast = useToastStore((state) => state.addToast);
	const { openFileAsActive } = useFileStore();
	const { saveFile } = fileOperations(projectId!);

	const {
		clearErrors,
		formState: { errors },
		getValues,
		handleSubmit,
		register,
		reset,
	} = useForm({
		defaultValues: {
			extension: { label: defalutFileExtension, value: defalutFileExtension },
			name: "",
		},
		resolver: zodResolver(codeFilesSchema),
	});

	useEffect(() => {
		reset({ extension: { label: defalutFileExtension, value: defalutFileExtension }, name: "" });
		clearErrors();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onSubmit = async () => {
		const { name } = getValues();
		try {
			const fileSaved = await saveFile(name, tTabsEditor("initialContentForNewFile"));
			if (!fileSaved) {
				addToast({
					message: t("fileAddFailed", { fileName: name }),
					type: "error",
				});

				LoggerService.error(
					namespaces.projectUICode,
					t("fileAddFailedExtended", {
						fileName: name,
						projectId,
						error: t("fileAddFailed", { fileName: name }),
					})
				);
				return;
			}
			openFileAsActive(name);
		} catch (error) {
			addToast({
				message: t("fileAddFailed", { fileName: name }),
				type: "error",
			});

			LoggerService.error(
				namespaces.projectUICode,
				t("fileAddFailedExtended", { fileName: name, projectId, error })
			);
		}
		clearErrors();
		closeModal(ModalName.addFile);
		reset({ extension: { label: defalutFileExtension, value: defalutFileExtension }, name: "" });
	};

	return (
		<Modal className="w-550" name={ModalName.addFile}>
			<div className="mx-6">
				<h3 className="mb-5 text-xl font-bold">{t("addFile.title", { ns: "modals" })}</h3>

				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="relative w-full">
						<Input
							{...register("name")}
							aria-label={t("addFile.ariaLabelNewFile", { ns: "modals" })}
							isError={!!errors.name}
							isRequired
							label={t("addFile.placeholderName", { ns: "modals" })}
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
