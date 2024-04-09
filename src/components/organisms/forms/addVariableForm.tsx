import React, { useState } from "react";
import { ArrowLeft } from "@assets/image/icons";
import { Button, Input, ErrorMessage, IconButton, Toast } from "@components/atoms";
import { zodResolver } from "@hookform/resolvers/zod";
import { VariablesService } from "@services";
import { useProjectStore } from "@store";
import { newVariableShema } from "@validations";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export const AddVariableForm = () => {
	const { t } = useTranslation("errors");
	const { t: tForm } = useTranslation("tabs", { keyPrefix: "variables.form" });
	const navigate = useNavigate();
	const {
		currentProject: { environments },
		getProjectVariables,
	} = useProjectStore();
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});
	const [isLoading, setIsLoading] = useState(false);

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
		const { error } = await VariablesService.create({
			envId: environments[0].envId,
			name,
			value,
			isSecret: false,
		});
		setIsLoading(false);

		if (error) {
			setToast({ isOpen: true, message: t("variableNotCreated", { name, value }) });
			return;
		}

		await getProjectVariables();
		navigate(-1);
	};

	return (
		<div className="min-w-550">
			<div className="flex justify-between mb-11">
				<div className="flex items-center gap-1">
					<IconButton className="hover:bg-black p-0 w-8 h-8" onClick={() => navigate(-1)}>
						<ArrowLeft />
					</IconButton>
					<p className="text-gray-300 text-base">{tForm("addNewVariable")}</p>
				</div>
				<div className="flex items-center gap-6">
					<Button className="text-gray-300 hover:text-white p-0 font-semibold" onClick={() => navigate(-1)}>
						{tForm("buttons.cancel")}
					</Button>
					<Button
						className="px-4 py-2 font-semibold text-white border-white hover:bg-black"
						form="createNewVariableForm"
						variant="outline"
					>
						{isLoading ? tForm("buttons.loading") + "..." : tForm("buttons.save")}
					</Button>
				</div>
			</div>
			{environments.length ? (
				<p className="text-lg mb-5">
					<strong>{tForm("environment")}:</strong> {environments[0].name}
				</p>
			) : null}
			<form className="flex flex-col gap-6" id="createNewVariableForm" onSubmit={handleSubmit(onSubmit)}>
				<div className="relative">
					<Input
						{...register("name")}
						className={dirtyFields["name"] ? "border-white" : ""}
						isError={!!errors.name}
						placeholder={tForm("placeholders.name")}
					/>
					<ErrorMessage>{errors.name?.message}</ErrorMessage>
				</div>
				<div className="relative">
					<Input
						{...register("value")}
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
	);
};
