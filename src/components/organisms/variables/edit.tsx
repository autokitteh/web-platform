import React, { useEffect, useState } from "react";

import { LockSolid } from "@assets/image/icons";
import { ErrorMessage, Input, Loader, Toggle } from "@components/atoms";
import { TabFormHeader } from "@components/molecules";
import { zodResolver } from "@hookform/resolvers/zod";
import { VariablesService } from "@services";
import { useToastStore } from "@store/useToastStore";
import { newVariableShema } from "@validations";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

export const EditVariable = () => {
	const { t: tForm } = useTranslation("tabs", { keyPrefix: "variables.form" });
	const addToast = useToastStore((state) => state.addToast);

	const { environmentId, projectId, variableName } = useParams();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingData, setIsLoadingData] = useState(true);

	const {
		formState: { dirtyFields, errors },
		getValues,
		handleSubmit,
		register,
		reset,
		watch,
	} = useForm({
		defaultValues: {
			name: "",
			value: "",
		},
		resolver: zodResolver(newVariableShema),
	});
	const [isSecret, setIsSecret] = useState(false);

	const fetchVariable = async () => {
		const { data: currentVar, error } = await VariablesService.get(environmentId!, variableName!);
		setIsLoadingData(false);

		if (error) {
			addToast({
				id: Date.now().toString(),
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
		});
		setIsSecret(currentVar.isSecret);
	};

	useEffect(() => {
		fetchVariable();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onSubmit = async () => {
		const { name, value } = getValues();
		setIsLoading(true);
		const { error } = await VariablesService.set(projectId!, {
			isSecret,
			name,
			scopeId: "",
			value,
		});

		if (error) {
			addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
			});
		}

		navigate(-1);
	};

	const { name, value } = watch();

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

			<form className="flex flex-col gap-6" id="modifyVariableForm" onSubmit={handleSubmit(onSubmit)}>
				<div className="relative">
					<Input
						value={name}
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
						value={value}
						{...register("value")}
						aria-label={tForm("placeholders.value")}
						className={dirtyFields["value"] ? "border-white" : ""}
						isError={!!errors.value}
						placeholder={isSecret ? "**********" : tForm("placeholders.value")}
					/>

					<ErrorMessage ariaLabel={tForm("ariaValueRequired")}>{errors.value?.message}</ErrorMessage>
				</div>

				<div className="flex gap-2 items-center" title={tForm("isSecret")}>
					<Toggle checked={isSecret} onChange={setIsSecret} /> <LockSolid className="fill-white h-4 w-4" />
				</div>
			</form>
		</div>
	);
};
