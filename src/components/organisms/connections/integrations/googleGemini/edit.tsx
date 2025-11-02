import React, { useEffect, useState } from "react";

import { useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { integrationVariablesMapping } from "@src/constants";
import { useConnectionForm } from "@src/hooks";
import { setFormValues } from "@src/utilities";
import { googleGeminiIntegrationSchema } from "@validations";

import { Button, ErrorMessage, SecretInput, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const GoogleGeminiIntegrationEditForm = () => {
	const { t } = useTranslation("integrations");
	const [lockState, setLockState] = useState(true);
	const { connectionVariables, control, errors, handleSubmit, isLoading, onSubmitEdit, register, setValue } =
		useConnectionForm(googleGeminiIntegrationSchema, "edit");

	const apiKey = useWatch({ control, name: "apiKey" });

	useEffect(() => {
		setFormValues(connectionVariables, integrationVariablesMapping.googlegemini, setValue);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionVariables]);

	return (
		<form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmitEdit)}>
			<div className="relative">
				<SecretInput
					type="password"
					{...register("apiKey")}
					aria-label={t("gemini.placeholders.apiKey")}
					disabled={isLoading}
					handleInputChange={(newValue) => setValue("apiKey", newValue)}
					handleLockAction={setLockState}
					isError={!!errors.apiKey}
					isLocked={lockState}
					isRequired
					label={t("gemini.placeholders.apiKey")}
					value={apiKey}
				/>
				<ErrorMessage>{errors.apiKey?.message as string}</ErrorMessage>
			</div>

			<Accordion title={t("information")}>
				<div className="flex flex-col gap-2">
					<Link
						className="group inline-flex items-center gap-2.5 text-green-800"
						target="_blank"
						to="https://aistudio.google.com/app"
					>
						{t("gemini.information.aiStudio")}
						<ExternalLinkIcon className="size-3.5 fill-green-800 duration-200" />
					</Link>

					<Link
						className="group inline-flex items-center gap-2.5 text-green-800"
						target="_blank"
						to="https://aistudio.google.com/app/apikey"
					>
						{t("gemini.information.apiKeys")}
						<ExternalLinkIcon className="size-3.5 fill-green-800 duration-200" />
					</Link>
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
		</form>
	);
};
