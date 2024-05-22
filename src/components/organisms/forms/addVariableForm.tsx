import React, { useState } from "react";
import { Input, ErrorMessage, Toast, Switch } from "@components/atoms";
import { TabFormHeader } from "@components/molecules";
import { zodResolver } from "@hookform/resolvers/zod";
import { VariablesService } from "@services";
import { newVariableShema } from "@validations";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

export const AddVariableForm = () => {
	const { t } = useTranslation("errors");
	const { t: tForm } = useTranslation("tabs", { keyPrefix: "variables.form" });
	const navigate = useNavigate();
	const { projectId } = useParams();
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});
	const [isLoading, setIsLoading] = useState(false);
	const [isSecret, setIsSecret] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors, dirtyFields },
		getValues,
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
		setIsLoading(false);

		if (error) {
			setToast({ isOpen: true, message: t("variableNotCreated") });
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
				<Switch checked={isSecret} label="Is secret?" onChange={setIsSecret} />
			</form>
			<Toast
				duration={5}
				isOpen={toast.isOpen}
				onClose={() => setToast({ ...toast, isOpen: false })}
				title={t("error")}
				type="error"
			>
				<p className="mt-1 text-xs">{toast.message}</p>
			</Toast>
		</div>
	);
};
