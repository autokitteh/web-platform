import React, { useEffect, useState } from "react";

import { useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { infoPipedriveLinks } from "@constants/lists/connections";
import { integrationVariablesMapping } from "@src/constants";
import { useConnectionForm } from "@src/hooks";
import { setFormValues } from "@src/utilities";
import { pipedriveIntegrationSchema } from "@validations";

import { Button, ErrorMessage, Link, SecretInput, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const PipedriveIntegrationEditForm = () => {
	const { t } = useTranslation("integrations");
	const [lockState, setLockState] = useState(true);

	const { connectionVariables, control, errors, handleSubmit, isLoading, onSubmitEdit, register, setValue } =
		useConnectionForm(pipedriveIntegrationSchema, "edit");

	// eslint-disable-next-line @typescript-eslint/naming-convention
	const api_key = useWatch({ control, name: "api_key" });

	useEffect(() => {
		setFormValues(connectionVariables, integrationVariablesMapping.pipedrive, setValue);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionVariables]);

	return (
		<form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmitEdit)}>
			<div className="relative">
				<SecretInput
					type="password"
					{...register("api_key")}
					aria-label={t("pipedrive.placeholders.apiKey")}
					disabled={isLoading}
					handleInputChange={(newValue) => setValue("api_key", newValue)}
					handleLockAction={setLockState}
					isError={!!errors.api_key}
					isLocked={lockState}
					isRequired
					label={t("pipedrive.placeholders.apiKey")}
					value={api_key}
				/>
				<ErrorMessage>{errors.api_key?.message as string}</ErrorMessage>
			</div>

			<Accordion title={t("information")}>
				<div className="flex flex-col gap-2">
					{infoPipedriveLinks.map(({ text, url }, index) => (
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
		</form>
	);
};
