import React, { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { VariablesService } from "@services";
import { useToastStore } from "@store/useToastStore";
import { newVariableShema } from "@validations";

import { useSecretInputs } from "@hooks";

import { ErrorMessage, Input, SecretInput } from "@components/atoms";
import { TabFormHeader } from "@components/molecules";

export const AddVariable = () => {
	const { t } = useTranslation("errors");
	const { t: tForm } = useTranslation("tabs", { keyPrefix: "variables.form" });
	const navigate = useNavigate();
	const { projectId } = useParams();
	const [isLoading, setIsLoading] = useState(false);
	const addToast = useToastStore((state) => state.addToast);

	const {
		formState: { dirtyFields, errors },
		getValues,
		handleSubmit,
		register,
		setValue,
	} = useForm({
		defaultValues: {
			name: "",
			value: "",
		},
		resolver: zodResolver(newVariableShema),
	});

	const { locks, toggleLock } = useSecretInputs({ value: false });

	const onSubmit = async () => {
		const { name, value } = getValues();
		setIsLoading(true);
		const { error } = await VariablesService.set(projectId!, {
			isSecret: locks.value,
			name,
			scopeId: "",
			value,
		});
		setIsLoading(false);

		if (error) {
			addToast({
				id: Date.now().toString(),
				message: t("variableNotCreated") + (error as Error).message,
				type: "error",
			});

			return;
		}
		navigate(-1);
	};

	return (
		<div className="min-w-80">
			<TabFormHeader
				className="mb-11"
				form="createNewVariableForm"
				isLoading={isLoading}
				title={tForm("addNewVariable")}
			/>

			<form className="flex flex-col gap-6" id="createNewVariableForm" onSubmit={handleSubmit(onSubmit)}>
				<div className="relative">
					<Input
						{...register("name", { required: t("nameRequired") })}
						aria-label={tForm("placeholders.name")}
						className={dirtyFields["name"] ? "border-white" : ""}
						isError={!!errors.name}
						placeholder={tForm("placeholders.name")}
					/>

					<ErrorMessage ariaLabel={tForm("ariaNameRequired")}>{errors.name?.message}</ErrorMessage>
				</div>

				<div className="relative">
					<SecretInput
						isLocked={locks.value}
						onChange={(event) => {
							setValue("value", event.target.value);
						}}
						onLock={() => toggleLock("value")}
						placeholder={tForm("placeholders.value")}
						register={register("value")}
					/>

					<ErrorMessage ariaLabel={tForm("ariaValueRequired")}>{errors.value?.message}</ErrorMessage>
				</div>
			</form>
		</div>
	);
};
