import React, { useState } from "react";

import { useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { infoPipedriveLinks } from "@constants/lists/connections";
import { IntegrationEditFormProps } from "@interfaces/components";
import { useConnectionForm } from "@src/hooks";
import { pipedriveIntegrationSchema } from "@validations";

import { Button, ErrorMessage, Input, Link, SecretInput, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const PipedriveIntegrationEditForm = ({ editedConnectionName }: IntegrationEditFormProps) => {
	const { t } = useTranslation("integrations");
	const [lockState, setLockState] = useState(true);

	const { control, errors, handleSubmit, isLoading, onSubmitEdit, register, setValue, updateConnectionName } =
		useConnectionForm(pipedriveIntegrationSchema, "edit");

	// eslint-disable-next-line @typescript-eslint/naming-convention
	const api_key = useWatch({ control, name: "api_key" });
	const companyDomain = useWatch({ control, name: "company_domain" });

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

			<div className="relative">
				<Input
					{...register("company_domain")}
					aria-label={t("pipedrive.placeholders.companyDomain")}
					disabled={isLoading}
					isError={!!errors.company_domain}
					isRequired
					label={t("pipedrive.placeholders.companyDomain")}
					value={companyDomain}
				/>
				<ErrorMessage>{errors.company_domain?.message as string}</ErrorMessage>
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
