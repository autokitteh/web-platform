import React, { useEffect, useState } from "react";

import { FieldValues, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { integrationVariablesMapping } from "@src/constants";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { setFormValues } from "@src/utilities";
import { auth0IntegrationSchema } from "@validations";

import { Button, ErrorMessage, Input, Loader, SecretInput } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon } from "@assets/image/icons";

export const Auth0IntegrationEditForm = () => {
	const { t } = useTranslation("integrations");
	const { connectionVariables, control, errors, handleCustomOauth, handleSubmit, isLoading, register, setValue } =
		useConnectionForm(auth0IntegrationSchema, "edit");
	const [lockState, setLockState] = useState(true);
	const { connectionId } = useParams();

	useEffect(() => {
		setFormValues(connectionVariables, integrationVariablesMapping.auth0, setValue);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionVariables]);

	const clientSecret = useWatch({ control, name: "client_secret" });
	const clientId = useWatch({ control, name: "client_id" });
	const auth0Domain = useWatch({ control, name: "auth0_domain" });

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const openOauthPopUp = (_data: FieldValues) => {
		handleCustomOauth(connectionId!, Integrations.auth0);
	};

	return (
		<form className="mt-6 flex flex-col gap-6" onSubmit={handleSubmit(openOauthPopUp)}>
			<div className="relative">
				<Input
					{...register("client_id")}
					aria-label={t("auth0.placeholders.client_id")}
					disabled={isLoading}
					isError={!!errors.client_id}
					isRequired
					label={t("auth0.placeholders.client_id")}
					value={clientId}
				/>

				<ErrorMessage>{errors.client_id?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				<SecretInput
					{...register("client_secret")}
					aria-label={t("auth0.placeholders.client_secret")}
					disabled={isLoading}
					handleInputChange={(newValue) => setValue("client_secret", newValue)}
					handleLockAction={setLockState}
					isError={!!errors.client_secret}
					isLocked={lockState}
					isRequired
					label={t("auth0.placeholders.client_secret")}
					type="password"
					value={clientSecret}
				/>

				<ErrorMessage>{errors.client_secret?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				<Input
					{...register("auth0_domain")}
					aria-label={t("auth0.placeholders.auth0_domain")}
					disabled={isLoading}
					isError={!!errors.auth0_domain}
					isRequired
					label={t("auth0.placeholders.auth0_domain")}
					value={auth0Domain}
				/>

				<ErrorMessage>{errors.auth0_domain?.message as string}</ErrorMessage>
			</div>

			<Accordion title={t("information")}>
				<Link
					className="group inline-flex items-center gap-2.5 text-green-800"
					target="_blank"
					to="https://docs.autokitteh.com/integrations/auth0/config/"
				>
					{t("auth0.information.akGuide")}

					<ExternalLinkIcon className="size-3.5 fill-green-800 duration-200" />
				</Link>
			</Accordion>

			<Button
				aria-label={t("buttons.startOAuthFlow")}
				className="ml-auto w-fit border-black bg-white px-3 font-medium hover:bg-gray-950 hover:text-white"
				disabled={isLoading}
				type="submit"
				variant="outline"
			>
				{isLoading ? <Loader size="sm" /> : null}
				{t("buttons.startOAuthFlow")}
			</Button>
		</form>
	);
};
