import React from "react";
import { Button, ErrorMessage, Input } from "@components/atoms";
import { Modal } from "@components/molecules";
import { namespaces } from "@constants";
import { EModalName } from "@enums/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { IModalAddCodeAssets } from "@interfaces/components";
import { LoggerService } from "@services";
import { useModalStore, useProjectStore } from "@store";
import { codeAssetsSchema } from "@validations";
import { useForm, FieldValues } from "react-hook-form";
import { useTranslation } from "react-i18next";

export const ModalAddCodeAssets = ({ onError }: IModalAddCodeAssets) => {
	const { t } = useTranslation("errors");
	const { closeModal } = useModalStore();
	const { currentProject, setProjectEmptyResources } = useProjectStore();

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
		if (error) {
			onError?.(t("projectAddFailed"));
			LoggerService.error(
				namespaces.projectUI,
				t("projectAddFailedExtended", { projectId: currentProject.projectId, error: (error as Error).message })
			);
			return;
		}
		reset();
	};

	return (
		<Modal name={EModalName.addCodeAssets}>
			<div className="mx-6">
				<h3 className="text-xl font-bold mb-5">Create new</h3>
				<form onSubmit={handleSubmit(onSubmit)}>
					<Input
						{...register("name")}
						aria-label="new file name"
						classInput="placeholder:text-gray-400 hover:placeholder:text-gray-800"
						className="bg-white hover:border-gray-700"
						isError={!!errors.name}
						isRequired
						placeholder="Name"
					/>
					<ErrorMessage className="relative">{errors.name?.message as string}</ErrorMessage>
					<Button className="font-bold justify-center mt-2 rounded-lg py-2.5" type="submit" variant="filled">
						Create
					</Button>
				</form>
			</div>
		</Modal>
	);
};
