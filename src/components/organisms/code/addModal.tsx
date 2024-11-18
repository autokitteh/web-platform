import React, { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { defalutFileExtension, monacoLanguages, namespaces } from "@constants";
import { ModalName } from "@enums/components";
import { LoggerService } from "@services";
import { codeAssetsSchema } from "@validations";

import { useFileOperations } from "@hooks";
import { useModalStore, useToastStore } from "@store";

import { Button, ErrorMessage, Input } from "@components/atoms";
import { Modal, Select } from "@components/molecules";

export const AddFileModal = () => {
	const { projectId } = useParams();
	const { t } = useTranslation(["errors", "buttons", "modals"]);
	const { t: tTabsEditor } = useTranslation("tabs", { keyPrefix: "editor" });
	const { closeModal } = useModalStore();
	const addToast = useToastStore((state) => state.addToast);
	const { openFileAsActive, saveFile } = useFileOperations(projectId!);

	const languageSelectOptions = Object.keys(monacoLanguages).map((key) => ({
		label: key,
		value: key,
	}));

	const {
		control,
		formState: { errors },
		getValues,
		handleSubmit,
		register,
		reset,
		setValue,
	} = useForm({
		defaultValues: {
			extension: { label: defalutFileExtension, value: defalutFileExtension },
			name: "",
		},
		resolver: zodResolver(codeAssetsSchema),
	});

	useEffect(() => {
		setValue("name", "");
	});

	const onSubmit = async () => {
		const { extension, name } = getValues();
		const newFile = name + extension.value;
		try {
			await saveFile(newFile, tTabsEditor("initialContentForNewFile"));
			openFileAsActive(newFile);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			addToast({
				message: t("fileAddFailed", { fileName: name }),
				type: "error",
			});

			LoggerService.error(namespaces.projectUICode, t("fileAddFailedExtended", { fileName: name, projectId }));
		}
		closeModal(ModalName.addCodeAssets);
		reset({ extension, name: "" });
	};

	return (
		<Modal className="w-550" name={ModalName.addCodeAssets}>
			<div className="mx-6">
				<h3 className="mb-5 text-xl font-bold">{t("addCodeAssets.title", { ns: "modals" })}</h3>

				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="flex gap-2">
						<div className="relative w-full">
							<Input
								{...register("name")}
								aria-label={t("addCodeAssets.ariaLabelNewFile", { ns: "modals" })}
								isError={!!errors.name}
								isRequired
								label={t("addCodeAssets.placeholderName", { ns: "modals" })}
								variant="light"
							/>

							<ErrorMessage className="relative">{errors.name?.message as string}</ErrorMessage>
						</div>

						<div className="relative w-36 shrink-0">
							<Controller
								control={control}
								name="extension"
								render={({ field }) => (
									<Select
										{...field}
										aria-label={t("addCodeAssets.selectExtension", { ns: "modals" })}
										isError={!!errors.extension}
										label={t("addCodeAssets.selectExtension", { ns: "modals" })}
										noOptionsLabel={t("addCodeAssets.noExtensionsAvailable", { ns: "modals" })}
										options={languageSelectOptions}
										placeholder={t("addCodeAssets.selectExtension", { ns: "modals" })}
										value={field.value}
										variant="light"
									/>
								)}
							/>

							<ErrorMessage className="relative">{errors.extension?.message as string}</ErrorMessage>
						</div>
					</div>

					<Button className="mt-3 justify-center rounded-lg py-2.5 font-bold" type="submit" variant="filled">
						{t("create", { ns: "buttons" })}
					</Button>
				</form>
			</div>
		</Modal>
	);
};
