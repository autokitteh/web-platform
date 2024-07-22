import React, { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { VariablesService } from "@services";
import { useToastStore } from "@store/useToastStore";
import { newVariableShema } from "@validations";

import { useSecretInput } from "@hooks";

import { ErrorMessage, Input, SecretInput, Toggle } from "@components/atoms";
import { TabFormHeader } from "@components/molecules";

import { LockSolid } from "@assets/image/icons";

export const AddVariable = () => {
	const { t } = useTranslation("errors");
	const { t: tForm } = useTranslation("tabs", { keyPrefix: "variables.form" });
	const navigate = useNavigate();
	const { projectId } = useParams();
	const [isLoading, setIsLoading] = useState(false);
	const [isSecret, setIsSecret] = useState(false);
	const addToast = useToastStore((state) => state.addToast);

	const {
		formState: { dirtyFields, errors },
		getValues,
		handleSubmit,
		register,
	} = useForm({
		defaultValues: {
			name: "",
			value: "",
		},
		resolver: zodResolver(newVariableShema),
	});

	const { isLocked, toggleLock } = useSecretInput(false); // Initialize the hook with default unlocked state

	const onSubmit = async () => {
		const { name, value } = getValues();
		setIsLoading(true);
		const { error } = await VariablesService.set(projectId!, {
			isSecret,
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
						{...register("name")}
						aria-label={tForm("placeholders.name")}
						className={dirtyFields["name"] ? "border-white" : ""}
						isError={!!errors.name}
						placeholder={tForm("placeholders.name")}
					/>

					<ErrorMessage ariaLabel={tForm("ariaNameRequired")}>{errors.name?.message}</ErrorMessage>
				</div>

				<div className="relative">
					<Input
						{...register("value")}
						aria-label={tForm("placeholders.value")}
						className={dirtyFields["value"] ? "border-white" : ""}
						isError={!!errors.value}
						placeholder={tForm("placeholders.value")}
					/>

					<ErrorMessage ariaLabel={tForm("ariaValueRequired")}>{errors.value?.message}</ErrorMessage>
				</div>

				<div className="flex items-center gap-2" title={tForm("isSecret")}>
					<Toggle checked={isSecret} onChange={setIsSecret} /> <LockSolid className="h-4 w-4 fill-white" />
				</div>

				<div className="relative">
					<SecretInput isLocked={isLocked} onLockClick={toggleLock} placeholder="Value" />

					<ErrorMessage ariaLabel={tForm("ariaValueRequired")}>{errors.value?.message}</ErrorMessage>
				</div>
			</form>
		</div>
	);
};
