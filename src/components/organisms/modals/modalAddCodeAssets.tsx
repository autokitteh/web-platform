import React, { useEffect } from "react";
import { Button, ErrorMessage, Input } from "@components/atoms";
import { Modal } from "@components/molecules";
import { zodResolver } from "@hookform/resolvers/zod";
import { useModalStore, useCodeAssetsStore } from "@store";
import { codeAssetsSchema } from "@validations";
import { useForm, FieldValues } from "react-hook-form";

interface IModalAddCodeAssets {
	file: File | undefined;
}

export const ModalAddCodeAssets = ({ file }: IModalAddCodeAssets) => {
	const { closeModal } = useModalStore();
	const { setCodeAsset } = useCodeAssetsStore();

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(codeAssetsSchema),
	});

	const onSubmit = (data: FieldValues) => {
		if (!file) return;

		const newName = `${data.name}.${file?.name.split(".").pop()}`;
		const updatedFile = new File([file], newName, { type: file.type });
		setCodeAsset(updatedFile);
		closeModal("addCodeAssets");
	};

	useEffect(() => setValue("name", file?.name.split(".").slice(0, -1).join(".")), [file]);

	return (
		<Modal name="addCodeAssets">
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
