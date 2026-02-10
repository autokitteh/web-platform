import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { IntegrationAddFormProps } from "@interfaces/components";
import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { pydanticgwIntegrationSchema } from "@validations";

import { Button, ErrorMessage, Input, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const PydanticGatewayIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
	onSuccess,
	isOrgConnection,
}: IntegrationAddFormProps) => {
	const { t } = useTranslation("integrations");

	const { createConnection, errors, handleSubmit, isLoading, register } = useConnectionForm(
		pydanticgwIntegrationSchema,
		"create",
		undefined,
		onSuccess,
		isOrgConnection
	);

	useEffect(() => {
		if (connectionId) {
			createConnection(connectionId, ConnectionAuthType.ApiKey, Integrations.pydanticgw);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	return (
		<form className="flex flex-col gap-6" onSubmit={handleSubmit(triggerParentFormSubmit)}>
			<div className="relative">
				<Input
					{...register("api_key")}
					aria-label={t("pydanticgw.placeholders.apiKey")}
					disabled={isLoading}
					isError={!!errors.api_key}
					isRequired
					isSensitive
					label={t("pydanticgw.placeholders.apiKey")}
				/>

				<ErrorMessage>{errors.api_key?.message as string}</ErrorMessage>
			</div>

			<Accordion title={t("information")}>
				<Link
					className="group inline-flex items-center gap-2.5 text-green-800"
					target="_blank"
					to="https://docs.pydantic.dev/"
				>
					{t("pydanticgw.information.documentation")}

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
