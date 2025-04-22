import React, { useEffect, useMemo, useState } from "react";

import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { defalutFileExtension, monacoLanguages, namespaces } from "@constants";
import { ModalName } from "@enums/components";
import { LoggerService } from "@services";
import { fileOperations } from "@src/factories";
import { validateEntitiesName } from "@src/utilities";

import { useFileStore, useModalStore, useToastStore } from "@store";

import { Loader, Button, ErrorMessage, Input } from "@components/atoms";
import { Modal, Select } from "@components/molecules";

export const AddFileModal = () => {
	const { projectId } = useParams();
	const { t } = useTranslation(["errors", "buttons", "modals"]);
	const { t: tTabsEditor } = useTranslation("tabs", { keyPrefix: "editor" });
	const { closeModal } = useModalStore();
	const addToast = useToastStore((state) => state.addToast);
	const { openFileAsActive, fileList } = useFileStore();
	const { saveFile } = fileOperations(projectId!);
	const [isCreatingFile, setIsCreatingFile] = useState(false);
	const languageSelectOptions = Object.keys(monacoLanguages).map((key) => ({
		label: key,
		value: key,
	}));
	const projectFilesSet = useMemo(
		() => new Set(fileList.list.map((name) => name.split(".").slice(0, -1).join("."))),
		[fileList]
	);

	const {
		clearErrors,
		control,
		formState: { errors },
		getValues,
		handleSubmit,
		register,
		reset,
	} = useForm({
		mode: "onChange",
		defaultValues: {
			extension: { label: defalutFileExtension, value: defalutFileExtension },
			name: "",
		},
	});

	useEffect(() => {
		reset({ extension: { label: defalutFileExtension, value: defalutFileExtension }, name: "" });
		clearErrors();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onSubmit = async () => {
		const { extension, name } = getValues();
		const newFile = name + extension.value;
		try {
			setIsCreatingFile(true);
			const fileSaved = await saveFile(newFile, tTabsEditor("initialContentForNewFile"));
			if (!fileSaved) {
				throw new Error();
			}

			addToast({
				message: tTabsEditor("fileCreated", { fileName: newFile }),
				type: "success",
			});
			openFileAsActive(newFile);
		} catch (error) {
			addToast({
				message: t("fileAddFailed", { fileName: name }),
				type: "error",
			});

			LoggerService.error(
				namespaces.projectUICode,
				t("fileAddFailedExtended", { fileName: name, projectId, error })
			);
		} finally {
			setIsCreatingFile(false);
			clearErrors();
			closeModal(ModalName.addCodeAssets);
			reset({ extension: { label: defalutFileExtension, value: defalutFileExtension }, name: "" });
		}
	};

	return (
		<Modal className="w-550" name={ModalName.addCodeAssets}>
			<div className="mx-6">
				<h3 className="mb-5 text-xl font-bold">{t("addCodeAssets.title", { ns: "modals" })}</h3>

				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="flex gap-2">
						<div className="relative w-full">
							<Input
								{...register("name", {
									required: t("nameRequired"),
									validate: (value) => validateEntitiesName(value, projectFilesSet) || true,
								})}
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

					<Button
						className="mt-3 justify-center rounded-lg py-2.5 font-bold"
						disabled={isCreatingFile}
						type="submit"
						variant="filled"
					>
						{isCreatingFile ? <Loader size="sm" /> : null}
						{t("create", { ns: "buttons" })}
					</Button>
				</form>
			</div>
		</Modal>
	);
};
