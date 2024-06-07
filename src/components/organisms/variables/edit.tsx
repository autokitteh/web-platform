import React, { useEffect, useState } from "react";
import { LockSolid } from "@assets/image/icons";
import { Input, ErrorMessage, Toggle } from "@components/atoms";
import { TabFormHeader } from "@components/molecules";
import { zodResolver } from "@hookform/resolvers/zod";
import { VariablesService } from "@services";
import { useToastStore } from "@store/useToastStore";
import { newVariableShema } from "@validations";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

export const EditVariable = () => {
	const { t } = useTranslation("errors");
	const { t: tForm } = useTranslation("tabs", { keyPrefix: "variables.form" });
	const addToast = useToastStore((state) => state.addToast);

	const { variableName, environmentId, projectId } = useParams();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingData, setIsLoadingData] = useState(true);
	const [isSecret, setIsSecret] = useState(false);

	const fetchVariable = async () => {
		const { data: currentVar, error } = await VariablesService.get(environmentId!, variableName!);
		setIsLoadingData(false);

		if (error) {
			addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
				title: t("error"),
			});
		}
		if (!currentVar) return;

		reset({
			name: currentVar.name,
			value: currentVar.isSecret ? "" : currentVar.value,
		});
		setIsSecret(currentVar.isSecret);
	};

	useEffect(() => {
		fetchVariable();
	}, []);

	const {
		register,
		handleSubmit,
		formState: { errors, dirtyFields },
		getValues,
		reset,
	} = useForm({
		resolver: zodResolver(newVariableShema),
		defaultValues: {
			name: "",
			value: "",
		},
	});

	const onSubmit = async () => {
		const { name, value } = getValues();
		setIsLoading(true);
		const { error } = await VariablesService.set(projectId!, {
			scopeId: "",
			name,
			value,
			isSecret,
		});

		if (error)
			addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
				title: t("error"),
			});

		navigate(-1);
	};

	return isLoadingData ? (
		<div className="flex flex-col justify-center h-full text-xl font-semibold text-center">{tForm("loading")}...</div>
	) : (
		<div className="min-w-80">
			<TabFormHeader
				className="mb-11"
				form="modifyVariableForm"
				isLoading={isLoading}
				title={tForm("modifyVariable")}
			/>
			<form className="flex flex-col gap-6" id="modifyVariableForm" onSubmit={handleSubmit(onSubmit)}>
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
						placeholder={isSecret ? "**********" : tForm("placeholders.value")}
					/>
					<ErrorMessage ariaLabel={tForm("ariaValueRequired")}>{errors.value?.message}</ErrorMessage>
				</div>
				<div className="flex items-center gap-2" title={tForm("isSecret")}>
					<Toggle checked={isSecret} onChange={setIsSecret} /> <LockSolid className="w-4 h-4 fill-white" />
				</div>
			</form>
		</div>
	);
};
