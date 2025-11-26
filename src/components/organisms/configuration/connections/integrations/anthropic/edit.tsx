import React, { useEffect, useState } from "react";

import { useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { getIntegrationVariables } from "@src/constants/connections";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { setFormValues } from "@src/utilities";
import { anthropicIntegrationSchema } from "@validations";

import { Button, ErrorMessage, SecretInput, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const AnthropicIntegrationEditForm = () => {
	const { t } = useTranslation("integrations");
	const [lockState, setLockState] = useState(true);
	const { connectionVariables, control, errors, handleSubmit, isLoading, onSubmitEdit, register, setValue } =
		useConnectionForm(anthropicIntegrationSchema, "edit");

	const apiKey = useWatch({ control, name: "api_key" });

	useEffect(() => {
		setFormValues(connectionVariables, getIntegrationVariables(Integrations.anthropic), setValue);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionVariables]);

	return (
		<form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmitEdit)}>
			<div className="relative">
				<SecretInput
					type="password"
					{...register("api_key")}
					aria-label={t("anthropic.placeholders.apiKey")}
					disabled={isLoading}
					handleInputChange={(newValue) => setValue("api_key", newValue)}
					handleLockAction={setLockState}
					isError={!!errors.api_key}
					isLocked={lockState}
					isRequired
					label={t("anthropic.placeholders.apiKey")}
					value={apiKey}
				/>

				<ErrorMessage>{errors.api_key?.message as string}</ErrorMessage>
			</div>

			<Accordion title={t("information")}>
				<Link
					className="group inline-flex items-center gap-2.5 text-green-800"
					target="_blank"
					to="https://docs.anthropic.com/claude/docs/getting-access-to-claude"
				>
					{t("anthropic.information.devPlatform")}

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
		</form>
	);
};
