import React, { useEffect, useState } from "react";
import { Button, ErrorMessage, Input } from "@components/atoms";
import { Modal } from "@components/molecules";
import { EModalName } from "@enums/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { IModalModifyVariable } from "@interfaces/components";
import { VariablesService } from "@services";
import { useModalStore, useProjectStore } from "@store";
import { TVariable } from "@type/models";
import { newVariableShema } from "@validations";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

export const ModalModifyVariable = ({ onError }: IModalModifyVariable) => {
	const { t } = useTranslation("tabs", { keyPrefix: "variables.modals.modify" });
	const { t: tForm } = useTranslation("tabs", { keyPrefix: "variables.form" });
	const [isLoading, setIsLoading] = useState(false);

	const data = useModalStore((state) => state.data as Omit<TVariable, "envId" | "isSecret">);
	const { closeModal } = useModalStore();

	const {
		currentProject: { environments },
		getProjectVariables,
	} = useProjectStore();

	const {
		register,
		handleSubmit,
		formState: { errors },
		getValues,
		reset,
	} = useForm({
		resolver: zodResolver(newVariableShema),
		defaultValues: { name: "", value: "" },
	});

	useEffect(() => reset({ name: data?.name, value: data?.value }), [data]);

	const onSubmit = async () => {
		const { name } = getValues();
		setIsLoading(true);
		const { error } = await VariablesService.update({
			envId: environments[0].envId,
			name,
		});
		setIsLoading(false);

		await getProjectVariables();

		if (error) onError(error as string);
		closeModal(EModalName.modifyVariable);
	};

	return (
		<Modal name={EModalName.modifyVariable}>
			<p className="text-xl font-bold mb-5">{t("title")}</p>
			<form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
				<div className="relative">
					<Input
						{...register("name")}
						classInput="placeholder:text-gray-400 hover:placeholder:text-gray-800"
						className="bg-white hover:border-gray-700"
						isError={!!errors.name}
						placeholder={tForm("placeholders.name")}
					/>
					<ErrorMessage>{errors.name?.message}</ErrorMessage>
				</div>
				<div className="relative">
					<Input
						{...register("value")}
						classInput="placeholder:text-gray-400 hover:placeholder:text-gray-800"
						className="bg-white hover:border-gray-700"
						isError={!!errors.value}
						placeholder={tForm("placeholders.value")}
					/>
					<ErrorMessage>{errors.value?.message}</ErrorMessage>
				</div>
				<div className="flex justify-end gap-2">
					<Button
						className="font-semibold py-3 px-4 hover:text-white w-auto"
						onClick={() => closeModal(EModalName.modifyVariable)}
						type="button"
					>
						{t("buttons.cancel")}
					</Button>
					<Button className="font-semibold py-3 px-4 bg-gray-700 w-auto" variant="filled">
						{isLoading ? tForm("buttons.loading") + "..." : tForm("buttons.save")}
					</Button>
				</div>
			</form>
		</Modal>
	);
};
