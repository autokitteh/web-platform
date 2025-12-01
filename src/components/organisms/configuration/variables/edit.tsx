import React, { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { EditVariableProps } from "@interfaces/components";
import { VariablesService } from "@services";
import { useCacheStore, useHasActiveDeployments } from "@src/store";
import { cn } from "@src/utilities";
import { useToastStore } from "@store/useToastStore";
import { newVariableShema } from "@validations";

import { ErrorMessage, Input, Loader, SecretInput } from "@components/atoms";
import { ActiveDeploymentWarning, TabFormHeader } from "@components/molecules";

export const EditVariable = ({ variableName: variableNameProp }: EditVariableProps = {}) => {
	const { t: tForm } = useTranslation("tabs", {
		keyPrefix: "variables.form",
	});
	const { t } = useTranslation("errors");

	const addToast = useToastStore((state) => state.addToast);
	const { fetchVariables } = useCacheStore();

	const { projectId, name: variableNameParam } = useParams();
	const variableName = variableNameProp || variableNameParam;
	const navigate = useNavigate();
	const onBack = () => navigate("..");
	const onSuccess = onBack;

	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingData, setIsLoadingData] = useState(true);
	const hasActiveDeployments = useHasActiveDeployments();
	const location = useLocation();

	const {
		control,
		formState: { dirtyFields, errors },
		getValues,
		handleSubmit,
		register,
		reset,
		setValue,
	} = useForm({
		defaultValues: {
			description: "",
			isSecret: false,
			name: "",
			value: "",
		},
		resolver: zodResolver(newVariableShema),
	});

	const description = useWatch({ control, name: "description" });
	const isSecret = useWatch({ control, name: "isSecret" });
	const name = useWatch({ control, name: "name" });
	const value = useWatch({ control, name: "value" });

	const fetchVariable = async () => {
		const { data: currentVar, error } = await VariablesService.get(projectId!, variableName!);
		setIsLoadingData(false);

		if (error) {
			addToast({
				message: t("errorFetchingVariable"),
				type: "error",
			});
		}
		if (!currentVar) {
			return;
		}

		reset({
			description: currentVar.description,
			isSecret: currentVar.isSecret,
			name: currentVar.name,
			value: currentVar.isSecret ? "" : currentVar.value,
		});
	};

	useEffect(() => {
		fetchVariable();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location]);

	const onSubmit = async () => {
		const { description, isSecret, name, value } = getValues();
		setIsLoading(true);
		const { error } = await VariablesService.setByProjectId(projectId!, {
			description,
			isSecret,
			name,
			scopeId: "",
			value,
		});

		if (error) {
			addToast({
				message: t("variableNotEdited"),
				type: "error",
			});
		}
		await fetchVariables(projectId!, true);
		setIsLoading(false);

		addToast({
			message: tForm("variableEditedSuccessfully"),
			type: "success",
		});

		onSuccess();
	};

	const nameClassName = cn("text-gray-300 placeholder:text-gray-1100", dirtyFields["name"] ? "border-white" : "");
	const valueClassName = cn("text-gray-300 placeholder:text-gray-1100", dirtyFields["value"] ? "border-white" : "");

	return isLoadingData ? (
		<Loader isCenter size="xl" />
	) : (
		<div className="min-w-80">
			<TabFormHeader
				className="mb-6"
				form="modifyVariableForm"
				isLoading={isLoading}
				onBack={onBack}
				title={tForm("modifyVariable")}
			/>

			{hasActiveDeployments ? <ActiveDeploymentWarning /> : null}

			<form className="flex flex-col gap-6" id="modifyVariableForm" onSubmit={handleSubmit(onSubmit)}>
				<div className="relative">
					<Input
						disabled
						value={name}
						{...register("name", { required: tForm("placeholders.name") })}
						aria-label={tForm("placeholders.name")}
						className={nameClassName}
						isError={!!errors.name}
						label={tForm("placeholders.name")}
					/>

					<ErrorMessage ariaLabel={tForm("ariaNameRequired")}>{errors.name?.message}</ErrorMessage>
				</div>

				<div className="relative">
					<Input
						value={description}
						{...register("description")}
						aria-label={tForm("placeholders.description")}
						label={tForm("placeholders.description")}
					/>

					<ErrorMessage ariaLabel={tForm("ariaDescriptionOptional")}>
						{errors.description?.message}
					</ErrorMessage>
				</div>

				<div className="relative">
					<SecretInput
						handleLockAction={(newState: boolean) => setValue("isSecret", newState)}
						label={tForm("placeholders.value")}
						{...register("value", {
							required: tForm("valueRequired"),
						})}
						aria-label={tForm("placeholders.value")}
						className={valueClassName}
						handleInputChange={(newValue) => setValue("value", newValue)}
						isLocked={isSecret}
						value={value}
					/>

					<ErrorMessage ariaLabel={tForm("ariaValueRequired")}>{errors.value?.message}</ErrorMessage>
				</div>
			</form>
		</div>
	);
};
