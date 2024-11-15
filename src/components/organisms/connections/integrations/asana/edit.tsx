import React, { useEffect } from "react";

import { useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { ModalName } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { useCacheStore, useModalStore } from "@src/store";
import { asanaIntegrationSchema } from "@validations";

import { Button, ErrorMessage, Input, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";
import { WarningDeploymentActivetedModal } from "@components/organisms";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const AsanaIntegrationEditForm = () => {
	const { t } = useTranslation("integrations");

	const { hasActiveDeployments } = useCacheStore();
	const { openModal } = useModalStore();
	const { connectionVariables, control, errors, handleSubmit, isLoading, onSubmitEdit, register, setValue } =
		useConnectionForm(asanaIntegrationSchema, "edit");

	const pat = useWatch({ control, name: "pat" });

	useEffect(() => {
		const patValue = connectionVariables?.find((variable) => variable.name === "pat")?.value || "";
		if (patValue) {
			setValue("pat", patValue);
		}
	}, [connectionVariables, setValue]);

	const handleFormSubmit = () => {
		if (hasActiveDeployments) {
			openModal(ModalName.warningDeploymentActive);

			return;
		}
		onSubmitEdit();
	};

	return (
		<form className="flex flex-col gap-6" onSubmit={handleSubmit(handleFormSubmit)}>
			<div className="relative">
				<Input
					{...register("pat")}
					aria-label={t("asana.placeholders.pat")}
					isError={!!errors.pat}
					isRequired
					label={t("asana.placeholders.pat")}
					onChange={(newValue) => setValue("pat", newValue)}
					value={pat}
				/>

				<ErrorMessage>{errors.pat?.message as string}</ErrorMessage>
			</div>

			<Accordion title={t("information")}>
				<Link
					className="group inline-flex items-center gap-2.5 text-green-800"
					target="_blank"
					to="https://developers.asana.com/"
				>
					{t("asana.information.devPlatform")}

					<ExternalLinkIcon className="size-3.5 fill-green-800 duration-200" />
				</Link>
			</Accordion>

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

			<WarningDeploymentActivetedModal onClick={onSubmitEdit} />
		</form>
	);
};
