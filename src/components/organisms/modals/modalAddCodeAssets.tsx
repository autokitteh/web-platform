import React from "react";
import { Button, ErrorMessage, Input } from "@components/atoms";
import { Modal } from "@components/molecules";
import { EModalName } from "@enums/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { IModalAddCodeAssets } from "@interfaces/components";
import { useModalStore, useProjectStore } from "@store";
import { codeAssetsSchema } from "@validations";
import { useForm, FieldValues } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

export const ModalAddCodeAssets = ({ onError }: IModalAddCodeAssets) => {
	const { projectId } = useParams();
	const { t } = useTranslation(["errors", "buttons", "modals", "forms"]);
	const { closeModal } = useModalStore();
	const { setProjectEmptyResources } = useProjectStore();

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm({
		resolver: zodResolver(codeAssetsSchema),
	});

	const onSubmit = async ({ name }: FieldValues) => {
		const { error } = await setProjectEmptyResources(name);
		closeModal(EModalName.addCodeAssets);

		if (error) onError(t("fileAddFailedExtended", { projectId, fileName: name }));
		reset();
	};

	return (
		<Modal name={EModalName.addCodeAssets}>
			<div className="mx-6">
				<h3 className="text-xl font-bold mb-5">{t("addCodeAssets.title", { ns: "modals" })}</h3>
				<form onSubmit={handleSubmit(onSubmit)}>
					<Input
						{...register("name")}
						aria-label={t("inputAriaLabelNewFile", { ns: "forms" })}
						classInput="placeholder:text-gray-400 hover:placeholder:text-gray-800"
						className="bg-white hover:border-gray-700"
						isError={!!errors.name}
						isRequired
						placeholder={t("inputPlaceholderName", { ns: "forms" })}
					/>
					<ErrorMessage className="relative">{errors.name?.message as string}</ErrorMessage>
					<Button className="font-bold justify-center mt-2 rounded-lg py-2.5" type="submit" variant="filled">
						{t("create", { ns: "buttons" })}
					</Button>
				</form>
			</div>
		</Modal>
	);
};
