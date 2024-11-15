import React, { useEffect } from "react";

import { useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { infoOpenAiLinks } from "@constants/lists/connections";
import { ModalName } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { useCacheStore, useModalStore } from "@src/store";
import { openAiIntegrationSchema } from "@validations";

import { Button, ErrorMessage, Input, Link, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";
import { WarningDeploymentActivetedModal } from "@components/organisms";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const OpenAiIntegrationEditForm = () => {
	const { t } = useTranslation("integrations");
	const { hasActiveDeployments } = useCacheStore();
	const { openModal } = useModalStore();

	const { connectionVariables, control, errors, handleSubmit, isLoading, onSubmitEdit, register, setValue } =
		useConnectionForm(openAiIntegrationSchema, "edit");

	const key = useWatch({ control, name: "key" });

	useEffect(() => {
		const apiKeyValue = connectionVariables?.find((variable) => variable.name === "apiKey")?.value;
		if (apiKeyValue) {
			setValue("key", apiKeyValue);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionVariables]);

	const handleFormSubmit = () => {
		if (hasActiveDeployments) {
			openModal(ModalName.warningDeploymentActive);

			return;
		}
		onSubmitEdit();
	};

	return (
		<form className="flex flex-col gap-4" onSubmit={handleSubmit(handleFormSubmit)}>
			<div className="relative">
				<Input
					{...register("key")}
					aria-label={t("openAi.placeholders.apiKey")}
					isError={!!errors.key}
					isRequired
					label={t("openAi.placeholders.apiKey")}
					onChange={(newValue) => setValue("key", newValue)}
					value={key}
				/>
				<ErrorMessage>{errors.key?.message as string}</ErrorMessage>
			</div>

			<Accordion title={t("information")}>
				<div className="flex flex-col gap-2">
					{infoOpenAiLinks.map(({ text, url }, index) => (
						<Link
							className="group inline-flex items-center gap-2.5 text-green-800"
							key={index}
							target="_blank"
							to={url}
						>
							{text}
							<ExternalLinkIcon className="size-3.5 fill-green-800 duration-200" />
						</Link>
					))}
				</div>
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
