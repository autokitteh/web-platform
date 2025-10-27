import React, { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { VariablesService } from "@services";
import { useCacheStore, useHasActiveDeployments } from "@src/store";
import { cn } from "@src/utilities";
import { useToastStore } from "@store/useToastStore";
import { newVariableShema } from "@validations";

import { Button, ErrorMessage, IconSvg, Input, SecretInput } from "@components/atoms";
import { ActiveDeploymentWarning } from "@components/molecules";

import { ArrowLeft } from "@assets/image/icons";

interface ProjectSettingsVariableAddProps {
	onBack: () => void;
}

export const ProjectSettingsVariableAdd = ({ onBack }: ProjectSettingsVariableAddProps) => {
	const { t } = useTranslation("errors");
	const { t: tForm } = useTranslation("tabs", { keyPrefix: "variables.form" });
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
		onBack();
	};

	const nameClassName = cn("text-white placeholder:text-white", dirtyFields["name"] ? "border-white" : "");

	return (
		<div className="mx-auto flex size-full flex-col gap-2 overflow-y-auto p-6">
			<div className="mb-4 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<Button
						ariaLabel="Back to Settings"
						className="rounded-full bg-transparent p-1.5 hover:bg-gray-800"
						onClick={onBack}
					>
						<IconSvg className="fill-white" src={ArrowLeft} />
					</Button>
					<h2 className="text-2xl font-semibold text-white">{tForm("addNewVariable")}</h2>
				</div>
			</div>

			{hasActiveDeployments ? <ActiveDeploymentWarning /> : null}

			<form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
				<div className="relative">
					<Input
						{...register("name", { required: t("nameRequired") })}
						aria-label={tForm("placeholders.name")}
						className={nameClassName}
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

				<div className="flex w-full justify-end gap-2">
					<Button
						ariaLabel={tForm("buttons.cancel")}
						className="px-4 py-3 font-semibold hover:bg-gray-1100 hover:text-white"
						onClick={onBack}
						variant="outline"
					>
						{tForm("buttons.cancel")}
					</Button>

					<Button
						ariaLabel={tForm("buttons.save")}
						className="px-4 py-3 font-semibold"
						disabled={isLoading}
						type="submit"
						variant="filled"
					>
						{isLoading ? tForm("buttons.loading") : tForm("buttons.save")}
					</Button>
				</div>
			</form>
		</div>
	);
};
