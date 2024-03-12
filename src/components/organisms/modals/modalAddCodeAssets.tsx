import React from "react";
import { Button, ErrorMessage, Input } from "@components/atoms";
import { Modal } from "@components/molecules";
import { zodResolver } from "@hookform/resolvers/zod";
import { codeAssetsSchema } from "@validations";
import { useForm } from "react-hook-form";

export const ModalAddCodeAssets = () => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(codeAssetsSchema),
	});

	const onSubmit = () => {};

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
