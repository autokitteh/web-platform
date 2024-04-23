import React, { useEffect, useState } from "react";
import { Input, ErrorMessage, Toast } from "@components/atoms";
import { TabFormHeader } from "@components/molecules";
import { zodResolver } from "@hookform/resolvers/zod";
import { VariablesService } from "@services";
import { useProjectStore } from "@store";
import { Variable } from "@type/models";
import { newVariableShema } from "@validations";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

export const ModifyVariableForm = () => {
	const { t } = useTranslation("errors");
	const { variableName, environmentId } = useParams();
	const { t: tForm } = useTranslation("tabs", { keyPrefix: "variables.form" });
	const navigate = useNavigate();
	const [currentVariable, setCurrentVariable] = useState<Variable>();
	const { getProjectVariables } = useProjectStore();
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});
	const [isLoading, setIsLoading] = useState(false);

	const fetchVariable = async () => {
		const { data: currentVar } = await VariablesService.get(environmentId!, variableName!);
		if (!currentVar) return;

		setCurrentVariable(currentVar);

		reset({
			name: currentVar.name,
			value: currentVar.value,
		});
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

		const { error } = await VariablesService.set({
			envId: environmentId!,
			name,
			value,
			isSecret: false,
		});

		if (error) setToast({ isOpen: true, message: (error as Error).message });

		await getProjectVariables();
		navigate(-1);
	};

	return currentVariable ? (
		<div className="min-w-550">
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
						disabled
						isError={!!errors.name}
						placeholder={tForm("placeholders.name")}
					/>
					<ErrorMessage>{errors.name?.message}</ErrorMessage>
				</div>
				<div className="relative">
					<Input
						{...register("value")}
						aria-label={tForm("placeholders.value")}
						className={dirtyFields["value"] ? "border-white" : ""}
						isError={!!errors.value}
						placeholder={tForm("placeholders.value")}
					/>
					<ErrorMessage>{errors.value?.message}</ErrorMessage>
				</div>
			</form>
			<Toast
				className="border-error"
				duration={5}
				isOpen={toast.isOpen}
				onClose={() => setToast({ ...toast, isOpen: false })}
			>
				<p className="font-semibold text-error">{t("error")}</p>
				<p className="mt-1 text-xs">{toast.message}</p>
			</Toast>
		</div>
	) : (
		<div>{tForm("loading")}...</div>
	);
};
