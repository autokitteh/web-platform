import React, { useEffect } from "react";

import { useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { getIntegrationVariables } from "@src/constants/connections";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { setFormValues } from "@src/utilities";
import { kubernetesIntegrationSchema } from "@validations";

import { Button, ErrorMessage, Spinner, Textarea } from "@components/atoms";

import { FloppyDiskIcon } from "@assets/image/icons";

export const KubernetesIntegrationEditForm = () => {
	const { t } = useTranslation("integrations");

	const { connectionVariables, control, errors, handleSubmit, isLoading, onSubmitEdit, register, setValue } =
		useConnectionForm(kubernetesIntegrationSchema, "edit");

	const key = useWatch({ control, name: "config_file" });

	useEffect(() => {
		setFormValues(connectionVariables, getIntegrationVariables(Integrations.kubernetes), setValue);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionVariables]);

	return (
		<form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmitEdit)}>
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
