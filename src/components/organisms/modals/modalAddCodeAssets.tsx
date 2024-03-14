import React from "react";
import { Button, ErrorMessage, Input } from "@components/atoms";
import { Modal } from "@components/molecules";
import { EModalName } from "@enums/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { IModalAddCodeAssets } from "@interfaces/components";
import { useModalStore, useProjectStore } from "@store";
import { codeAssetsSchema } from "@validations";
import { useForm, FieldValues } from "react-hook-form";

export const ModalAddCodeAssets = ({ onError, projectId }: IModalAddCodeAssets) => {
	const { closeModal } = useModalStore();
	const { setProjectResources } = useProjectStore();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(codeAssetsSchema),
	});

	const onSubmit = async (data: FieldValues) => {
		const { error } = await setProjectResources(data.name, projectId as string);
		closeModal(EModalName.addCodeAssets);
		if (error) {
			onError?.((error as Error).message);
			return;
		}
	};

	return (
		<Modal name={EModalName.addCodeAssets}>
			<div className="mx-6">
				<h3 className="text-xl font-bold mb-5">Add New</h3>
				<form onSubmit={handleSubmit(onSubmit)}>
					<Input
						{...register("name")}
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
