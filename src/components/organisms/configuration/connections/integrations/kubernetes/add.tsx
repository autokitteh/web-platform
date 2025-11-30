import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";

import { IntegrationAddFormProps } from "@interfaces/components";
import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { kubernetesIntegrationSchema } from "@validations";

import { Button, ErrorMessage, Spinner, Textarea } from "@components/atoms";

import { FloppyDiskIcon } from "@assets/image/icons";

export const KubernetesIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
	onSuccess,
	isGlobalConnection,
}: IntegrationAddFormProps) => {
	const { t } = useTranslation("integrations");

	const { createConnection, errors, handleSubmit, isLoading, register } = useConnectionForm(
		kubernetesIntegrationSchema,
		"create",
		undefined,
		onSuccess,
		isGlobalConnection
	);

	useEffect(() => {
		if (connectionId) {
			createConnection(connectionId, ConnectionAuthType.JsonKey, Integrations.kubernetes);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	return (
		<form className="flex flex-col gap-4" onSubmit={handleSubmit(triggerParentFormSubmit)}>
			<div className="relative">
				<Textarea
					rows={5}
					{...register("config_file")}
					aria-label={t("kubernetes.placeholders.configFile")}
					disabled={isLoading}
					isError={!!errors.config_file}
					placeholder={t("kubernetes.placeholders.configFile")}
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
