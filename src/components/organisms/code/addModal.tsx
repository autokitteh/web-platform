import React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { defalutFileExtension, monacoLanguages } from "@constants";
import { ModalName } from "@enums/components";
import { ModalAddCodeAssetsProps } from "@interfaces/components";
import { codeAssetsSchema } from "@validations";

import { useModalStore, useProjectStore, useToastStore } from "@store";

import { Button, ErrorMessage, Input, Select } from "@components/atoms";
import { Modal } from "@components/molecules";

export const AddFileModal = ({ onSuccess }: ModalAddCodeAssetsProps) => {
	const { projectId } = useParams();
	const { t } = useTranslation(["errors", "buttons", "modals"]);
	const { closeModal } = useModalStore();
	const { setProjectEmptyResources } = useProjectStore();
	const addToast = useToastStore((state) => state.addToast);

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
	} = useForm({
		defaultValues: {
			extension: { label: defalutFileExtension, value: defalutFileExtension },
			name: "",
		},
		resolver: zodResolver(codeAssetsSchema),
	});

	const onSubmit = async () => {
		const { extension, name } = getValues();
		const newFile = name + extension.value;
		const { error } = await setProjectEmptyResources(newFile, projectId!);
		closeModal(ModalName.addCodeAssets);

		if (error) {
			addToast({
				id: Date.now().toString(),
				message: t("fileAddFailedExtended", { fileName: name, projectId }),
				type: "error",
			});
		}
		onSuccess();
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
								placeholder={t("addCodeAssets.placeholderName", { ns: "modals" })}
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
