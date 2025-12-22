import React from "react";

import { useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { IntegrationEditFormProps } from "@interfaces/components";
import { useConnectionForm } from "@src/hooks";
import { kubernetesIntegrationSchema } from "@validations";

import { Button, ErrorMessage, Spinner, Textarea } from "@components/atoms";

import { FloppyDiskIcon } from "@assets/image/icons";

export const KubernetesIntegrationEditForm = ({ editedConnectionName }: IntegrationEditFormProps) => {
	const { t } = useTranslation("integrations");

	const { control, errors, handleSubmit, isLoading, onSubmitEdit, register, updateConnectionName } =
		useConnectionForm(kubernetesIntegrationSchema, "edit");

	const key = useWatch({ control, name: "config_file" });

	const handleSubmitWithNameUpdate = async () => {
		if (updateConnectionName && editedConnectionName) {
			const nameUpdated = await updateConnectionName(editedConnectionName);
			if (!nameUpdated) {
				return;
			}
		}
		onSubmitEdit();
	};

	return (
		<form className="flex flex-col gap-4" onSubmit={handleSubmit(handleSubmitWithNameUpdate)}>
			<div className="relative">
				<Textarea
					rows={5}
					{...register("config_file")}
					aria-label={t("kubernetes.placeholders.configFile")}
					disabled={isLoading}
					isError={!!errors.config_file}
					placeholder={t("kubernetes.placeholders.configFile")}
					value={key}
				/>
				<ErrorMessage>{errors.config_file?.message as string}</ErrorMessage>
			</div>

			<Button
				aria-label={t("buttons.saveConnection")}
				className="ml-auto w-fit border-white px-3 font-medium text-white hover:bg-black"
				disabled={isLoading}
				type="submit"
				variant="outline"
			>
				{isLoading ? <Spinner /> : <FloppyDiskIcon className="size-5 fill-white transition" />}
				{t("buttons.saveConnection")}
			</Button>
		</form>
	);
};
