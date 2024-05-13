import React from "react";
import { Button, ErrorMessage, Input, Select } from "@components/atoms";
import { Modal } from "@components/molecules";
import { monacoLanguages, defalutFileExtension } from "@constants";
import { ModalName } from "@enums/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { ModalAddCodeAssetsProps } from "@interfaces/components";
import { useModalStore, useProjectStore } from "@store";
import { codeAssetsSchema } from "@validations";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

export const ModalAddCodeAssets = ({ onError }: ModalAddCodeAssetsProps) => {
	const { projectId } = useParams();
	const { t } = useTranslation(["errors", "buttons", "modals"]);
	const { closeModal } = useModalStore();
	const { setProjectEmptyResources } = useProjectStore();
	const languageSelectOptions = Object.keys(monacoLanguages).map((key) => ({
		label: key,
		value: key,
	}));

	const {
		register,
		handleSubmit,
		formState: { errors },
		control,
		getValues,
		reset,
	} = useForm({
		resolver: zodResolver(codeAssetsSchema),
		defaultValues: {
			name: "",
			extension: { value: defalutFileExtension, label: defalutFileExtension },
		},
	});

	const onSubmit = async () => {
		const { name, extension } = getValues();
		const newFile = name + extension.value;
		const { error } = await setProjectEmptyResources(newFile);
		closeModal(ModalName.addCodeAssets);

		if (error) onError(t("fileAddFailedExtended", { projectId, fileName: name }));
		reset({ name: "", extension });
	};

	return (
		<Modal className="w-550" name={ModalName.addCodeAssets}>
			<div className="mx-6">
				<h3 className="text-xl font-bold mb-5">{t("addCodeAssets.title", { ns: "modals" })}</h3>
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="flex gap-2">
						<div className="relative w-full">
							<Input
								{...register("name")}
								aria-label={t("addCodeAssets.ariaLabelNewFile", { ns: "modals" })}
								classInput="placeholder:text-gray-400 hover:placeholder:text-gray-800"
								className="bg-white hover:border-gray-700"
								isError={!!errors.name}
								isRequired
								placeholder={t("addCodeAssets.placeholderName", { ns: "modals" })}
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
										options={languageSelectOptions}
										placeholder={t("addCodeAssets.selectExtension", { ns: "modals" })}
										value={field.value}
										variant="white"
									/>
								)}
							/>
							<ErrorMessage className="relative">{errors.extension?.message as string}</ErrorMessage>
						</div>
					</div>
					<Button className="font-bold justify-center mt-3 rounded-lg py-2.5" type="submit" variant="filled">
						{t("create", { ns: "buttons" })}
					</Button>
				</form>
			</div>
		</Modal>
	);
};
