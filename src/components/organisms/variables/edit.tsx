import React, { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { VariablesService } from "@services";
import { useCacheStore, useHasActiveDeployments } from "@src/store";
import { useToastStore } from "@store/useToastStore";
import { newVariableShema } from "@validations";

import { ErrorMessage, Input, Loader, SecretInput } from "@components/atoms";
import { ActiveDeploymentWarning, TabFormHeader } from "@components/molecules";

export const EditVariable = () => {
	const { t: tForm } = useTranslation("tabs", {
		keyPrefix: "variables.form",
	});
	const { t } = useTranslation("errors");

	const addToast = useToastStore((state) => state.addToast);
	const { fetchVariables } = useCacheStore();

	const { projectId, variableName } = useParams();
	const navigate = useNavigate();
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
				message: t("errorFetchingVariable"),
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
	}, [location]);

	const onSubmit = async () => {
		const { isSecret, name, value } = getValues();
		setIsLoading(true);
		const { error } = await VariablesService.setByProjectId(projectId!, {
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
			setIsLoading(false);
			return;
		}

		await fetchVariables(projectId!, true);

		try {
			const { iframeCommService } = await import("@services/iframeComm.service");
			iframeCommService.sendAssetsUpdated(projectId!, "variables");
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			// Silently handle iframe communication errors
		}

		setIsLoading(false);
		navigate(`/projects/${projectId}/variables`);
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
			{hasActiveDeployments ? <ActiveDeploymentWarning /> : null}

			<form className="flex flex-col gap-6" id="modifyVariableForm" onSubmit={handleSubmit(onSubmit)}>
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
		</div>
	);
};
