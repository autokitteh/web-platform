import React, { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { VariablesService } from "@services";
import { ModalName } from "@src/enums/components";
import { useCacheStore, useModalStore } from "@src/store";
import { useToastStore } from "@store/useToastStore";
import { newVariableShema } from "@validations";

import { ErrorMessage, Input, Loader, SecretInput } from "@components/atoms";
import { TabFormHeader } from "@components/molecules";
import { WarningDeploymentActivetedModal } from "@components/organisms";

export const EditVariable = () => {
	const { t: tForm } = useTranslation("tabs", {
		keyPrefix: "variables.form",
	});
	const { closeModal, openModal } = useModalStore();
	const addToast = useToastStore((state) => state.addToast);
	const { fetchVariables, hasActiveDeployments } = useCacheStore();

	const { projectId, variableName } = useParams();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingData, setIsLoadingData] = useState(true);

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
			name: "",
			value: "",
			isSecret: false,
		},
		resolver: zodResolver(newVariableShema),
	});

	const isSecret = useWatch({ control, name: "isSecret" });
	const name = useWatch({ control, name: "name" });
	const value = useWatch({ control, name: "value" });

	const fetchVariable = async () => {
		const { data: currentVar, error } = await VariablesService.get(projectId!, variableName!);
		setIsLoadingData(false);

		if (error) {
			addToast({
				message: (error as Error).message,
				type: "error",
			});
		}
		if (!currentVar) {
			return;
		}

		reset({
			name: currentVar.name,
			value: currentVar.isSecret ? "" : currentVar.value,
			isSecret: currentVar.isSecret,
		});
	};

	useEffect(() => {
		fetchVariable();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onSubmit = async () => {
		closeModal(ModalName.warningDeploymentActive);
		const { isSecret, name, value } = getValues();
		setIsLoading(true);
		const { error } = await VariablesService.setByProjectId(projectId!, {
			isSecret,
			name,
			scopeId: "",
			value,
		});

		if (error) {
			throw error;
		}
		await fetchVariables(projectId!, true);
		setIsLoading(false);

		navigate(-1);
	};

	const handleFormSubmit = () => {
		if (hasActiveDeployments) {
			openModal(ModalName.warningDeploymentActive);

			return;
		}
		onSubmit();
	};

	return isLoadingData ? (
		<Loader isCenter size="xl" />
	) : (
		<div className="min-w-80">
			<TabFormHeader
				className="mb-11"
				form="modifyVariableForm"
				isLoading={isLoading}
				title={tForm("modifyVariable")}
			/>

			<form className="flex flex-col gap-6" id="modifyVariableForm" onSubmit={handleSubmit(handleFormSubmit)}>
				<div className="relative">
					<Input
						value={name}
						{...register("name", { required: tForm("placeholders.name") })}
						aria-label={tForm("placeholders.name")}
						className={dirtyFields["name"] ? "border-white" : ""}
						isError={!!errors.name}
						label={tForm("placeholders.name")}
					/>

					<ErrorMessage ariaLabel={tForm("ariaNameRequired")}>{errors.name?.message}</ErrorMessage>
				</div>

				<div className="relative">
					<SecretInput
						handleLockAction={(newState: boolean) => setValue("isSecret", newState)}
						label={tForm("placeholders.value")}
						{...register("value", {
							required: tForm("valueRequired"),
						})}
						aria-label={tForm("placeholders.value")}
						handleInputChange={(newValue) => setValue("value", newValue)}
						isLocked={isSecret}
						value={value}
					/>

					<ErrorMessage ariaLabel={tForm("ariaValueRequired")}>{errors.value?.message}</ErrorMessage>
				</div>
			</form>

			<WarningDeploymentActivetedModal onClick={onSubmit} />
		</div>
	);
};
