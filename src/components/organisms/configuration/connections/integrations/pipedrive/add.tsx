import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";

import { infoPipedriveLinks } from "@constants/lists/connections";
import { IntegrationAddFormProps } from "@interfaces/components";
import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { pipedriveIntegrationSchema } from "@validations";

import { Button, ErrorMessage, Input, Link, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const PipedriveIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
	onSuccess,
	isGlobalConnection,
}: IntegrationAddFormProps) => {
	const { t } = useTranslation("integrations");

	const { createConnection, errors, handleSubmit, isLoading, register } = useConnectionForm(
		pipedriveIntegrationSchema,
		"create",
		undefined,
		onSuccess,
		isGlobalConnection
	);

	useEffect(() => {
		if (connectionId) {
			createConnection(connectionId, ConnectionAuthType.ApiKey, Integrations.pipedrive);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	return (
		<form className="flex flex-col gap-6" onSubmit={handleSubmit(triggerParentFormSubmit)}>
			<div className="relative">
				<Input
					{...register("api_key")}
					aria-label={t("pipedrive.placeholders.apiKey")}
					disabled={isLoading}
					isError={!!errors.api_key}
					isRequired
					isSensitive
					label={t("pipedrive.placeholders.apiKey")}
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
