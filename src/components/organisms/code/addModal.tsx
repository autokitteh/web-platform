import React, { useEffect, useMemo } from "react";

import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { defalutFileExtension, monacoLanguages } from "@constants";
import { ModalName } from "@enums/components";
import { validateEntitiesName } from "@src/utilities";

import { useFileStore, useModalStore } from "@store";

import { Loader, Button, ErrorMessage, Input } from "@components/atoms";
import { Modal, Select } from "@components/molecules";

export const AddFileModal = ({
	isCreating,
	onAddNewFile,
}: {
	isCreating: boolean;
	onAddNewFile: (fileName: string) => Promise<void>;
}) => {
	const { t } = useTranslation(["errors", "buttons", "modals"]);
	const { closeModal } = useModalStore();
	const { fileList } = useFileStore();

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
		await onAddNewFile(newFile);

		clearErrors();
		reset({ extension: { label: defalutFileExtension, value: defalutFileExtension }, name: "" });
		closeModal(ModalName.addCodeAssets);
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
						disabled={isCreating}
						type="submit"
						variant="filled"
					>
						{isCreating ? <Loader size="sm" /> : null}
						{t("create", { ns: "buttons" })}
					</Button>
				</form>
			</div>
		</Modal>
	);
};
