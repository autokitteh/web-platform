import React, { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { VariablesService } from "@services";
import { useToastStore } from "@store/useToastStore";
import { newVariableShema } from "@validations";

import { useCacheStore, useHasActiveDeployments } from "@store";

import { ErrorMessage, Input, SecretInput } from "@components/atoms";
import { ActiveDeploymentWarning, TabFormHeader } from "@components/molecules";

export const AddVariable = () => {
	const { t } = useTranslation("errors");
	const { t: tForm } = useTranslation("tabs", { keyPrefix: "variables.form" });
	const navigate = useNavigate();
	const { projectId } = useParams();
	const [isLoading, setIsLoading] = useState(false);
	const addToast = useToastStore((state) => state.addToast);
	const { fetchVariables } = useCacheStore();
	const hasActiveDeployments = useHasActiveDeployments();

	const {
		control,
		formState: { dirtyFields, errors },
		getValues,
		handleSubmit,
		register,
		setValue,
	} = useForm({
		defaultValues: {
			name: "",
			value: "",
			isSecret: false,
		},
		resolver: zodResolver(newVariableShema),
	});

	const isSecret = useWatch({ control, name: "isSecret" });

	const onSubmit = async () => {
		const { name, value } = getValues();
		setIsLoading(true);
		const { error } = await VariablesService.setByProjectId(projectId!, {
			isSecret,
			name,
			scopeId: "",
			value,
		});
		setIsLoading(false);

		if (error) {
			addToast({
				message: t("variableNotCreated"),
				type: "error",
			});

			return;
		}
		await fetchVariables(projectId!, true);
		navigate(-1);
	};

	return (
		<div className="min-w-80">
			<TabFormHeader
				className="mb-11"
				form="createNewVariableForm"
				isLoading={isLoading}
				title={tForm("addNewVariable")}
			/>{" "}
			{hasActiveDeployments ? <ActiveDeploymentWarning /> : null}
			<form className="flex flex-col gap-6" id="createNewVariableForm" onSubmit={handleSubmit(onSubmit)}>
				<div className="relative">
					<Input
						{...register("name", { required: t("nameRequired") })}
						aria-label={tForm("placeholders.name")}
						className={dirtyFields["name"] ? "border-white" : ""}
						isError={!!errors.name}
						label={tForm("placeholders.name")}
					/>

					<ErrorMessage ariaLabel={tForm("ariaNameRequired")}>{errors.name?.message}</ErrorMessage>
				</div>

				<div className="relative">
					<SecretInput
						handleLockAction={(newState) => {
							setValue("isSecret", newState);
						}}
						isLocked={isSecret}
						label={tForm("placeholders.value")}
						{...register("value")}
						aria-label={tForm("placeholders.value")}
						handleInputChange={(newValue) => setValue("value", newValue)}
					/>

					<ErrorMessage ariaLabel={tForm("ariaValueRequired")}>{errors.value?.message}</ErrorMessage>
				</div>
			</form>
		</div>
	);
};
