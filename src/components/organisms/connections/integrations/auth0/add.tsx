import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";

import { infoAuth0Links } from "@constants/lists";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { auth0IntegrationSchema } from "@validations";

import { Button, ErrorMessage, Input, Link, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon } from "@assets/image/icons";

export const Auth0IntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
}: {
	connectionId?: string;
	triggerParentFormSubmit: () => void;
}) => {
	const { t } = useTranslation("integrations");

	const { errors, handleCustomOauth, handleSubmit, isLoading, register } = useConnectionForm(
		auth0IntegrationSchema,
		"create"
	);

	useEffect(() => {
		if (connectionId) {
			handleCustomOauth(connectionId, Integrations.auth0);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	return (
		<form className="mt-6 flex flex-col gap-6" onSubmit={handleSubmit(triggerParentFormSubmit)}>
			<div className="relative">
				<Input
					{...register("client_id")}
					aria-label={t("auth0.placeholders.client_id")}
					disabled={isLoading}
					isError={!!errors.client_id}
					isRequired
					label={t("auth0.placeholders.client_id")}
				/>

				<ErrorMessage>{errors.client_id?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				<Input
					{...register("client_secret")}
					aria-label={t("auth0.placeholders.client_secret")}
					disabled={isLoading}
					isError={!!errors.client_secret}
					isRequired
					label={t("auth0.placeholders.client_secret")}
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
				/>

				<ErrorMessage>{errors.auth0_domain?.message as string}</ErrorMessage>
			</div>

			<Accordion title={t("information")}>
				<div className="flex flex-col gap-2">
					{infoAuth0Links.map(({ text, url }, index: number) => (
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
				aria-label={t("buttons.startOAuthFlow")}
				className="ml-auto w-fit border-white px-3 font-medium text-white hover:bg-black"
				disabled={isLoading}
				type="submit"
				variant="outline"
			>
				{isLoading ? <Spinner /> : <ExternalLinkIcon className="size-4 fill-white transition" />}
				{t("buttons.startOAuthFlow")}
			</Button>
		</form>
	);
};
