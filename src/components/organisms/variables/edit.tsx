import React, { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { VariablesService } from "@services";
import { useToastStore } from "@store/useToastStore";
import { newVariableShema } from "@validations";

import { useSecretInputs } from "@hooks";

import { ErrorMessage, Input, Loader } from "@components/atoms";
import { TabFormHeader } from "@components/molecules";

export const EditVariable = () => {
	const { t: tForm } = useTranslation("tabs", {
		keyPrefix: "variables.form",
	});
	const addToast = useToastStore((state) => state.addToast);

	const { environmentId, projectId, variableName } = useParams();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingData, setIsLoadingData] = useState(true);
	// const [firstFocus, setFirstFocus] = useState(true);

	const {
		formState: { dirtyFields, errors },
		getValues,
		handleSubmit,
		register,
		reset,
		// setValue,
		watch,
	} = useForm({
		defaultValues: {
			name: "",
			value: "",
			isSecret: false,
		},
		resolver: zodResolver(newVariableShema),
	});

	const { locks, toggleLock } = useSecretInputs({ value: false });
	const { name, value } = watch();

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

		toggleLock(currentVar.value);

		reset({
			name: currentVar.name,
			value: currentVar.isSecret ? "**********" : value,
			isSecret: currentVar.isSecret,
		});
	};

	useEffect(() => {
		fetchVariable();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onSubmit = async () => {
		const { name, value } = getValues();
		const secretValue = value === "**********" ? "" : value;
		setIsLoading(true);
		const { error } = await VariablesService.set(projectId!, {
			isSecret: locks.value,
			name,
			scopeId: "",
			value: secretValue,
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

	// const handleFocus = () => {
	// 	if (locks.value && firstFocus) {
	// 		setValue("value", "");
	// 		setFirstFocus(false);
	// 	}
	// };

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
						{...register("name", { required: tForm("placeholders.name") })}
						aria-label={tForm("placeholders.name")}
						className={dirtyFields["name"] ? "border-white" : ""}
						isError={!!errors.name}
						placeholder={tForm("placeholders.name")}
					/>

					<ErrorMessage ariaLabel={tForm("ariaNameRequired")}>{errors.name?.message}</ErrorMessage>
				</div>

				<div className="relative">
					{/* <SecretInput
						isLocked={locks.value}
						onChange={(event) => {
							setValue("value", event.target.value);
						}}
						onFocus={handleFocus}
						onLock={(event: boolean) => setValue("isSecret", event)}
						placeholder={tForm("placeholders.value")}
						register={register("value", { required: tForm("valueRequired") })}
						value={value}
					/> */}

					<ErrorMessage ariaLabel={tForm("ariaValueRequired")}>{errors.value?.message}</ErrorMessage>
				</div>
			</form>
		</div>
	);
};
