import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";

import { infoRedditLinks } from "@constants/lists";
import { BackendConnectionAuthType, ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { useConnectionForm, useCrossFieldValidation } from "@src/hooks";
import { redditPrivateAuthIntegrationSchema } from "@validations";

import { Button, ErrorMessage, Input, Link, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const RedditIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
}: {
	connectionId?: string;
	triggerParentFormSubmit: () => void;
}) => {
	const { t } = useTranslation("integrations", { keyPrefix: "reddit" });
	const { t: tIntegrations } = useTranslation("integrations");

	const { createConnection, errors, handleSubmit, isLoading, register, trigger } = useConnectionForm(
		redditPrivateAuthIntegrationSchema,
		"create"
	);

	const handleUsernameChange = useCrossFieldValidation(trigger, ["password"]);
	const handlePasswordChange = useCrossFieldValidation(trigger, ["username"]);

	useEffect(() => {
		if (connectionId) {
			createConnection(
				connectionId,
				ConnectionAuthType.OauthPrivate,
				BackendConnectionAuthType.oauth_private,
				null,
				Integrations.reddit
			);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	return (
		<form className="flex w-full flex-col gap-6" onSubmit={handleSubmit(triggerParentFormSubmit)}>
			<div className="relative">
				<Input
					{...register("client_id")}
					aria-label={t("placeholders.clientId")}
					disabled={isLoading}
					isError={!!errors.client_id}
					isRequired
					isSensitive
					label={t("placeholders.clientId")}
				/>

				<ErrorMessage>{errors.client_id?.message as string}</ErrorMessage>
			</div>

			<div className="relative">
				<Input
					{...register("client_secret")}
					aria-label={t("placeholders.clientSecret")}
					disabled={isLoading}
					isError={!!errors.client_secret}
					isRequired
					isSensitive
					label={t("placeholders.clientSecret")}
				/>

				<ErrorMessage>{errors.client_secret?.message as string}</ErrorMessage>
			</div>

			<div className="relative">
				<Input
					{...register("user_agent")}
					aria-label={t("placeholders.userAgent")}
					disabled={isLoading}
					hint={t("hints.userAgent")}
					isError={!!errors.user_agent}
					isRequired
					isSensitive
					label={t("placeholders.userAgent")}
				/>

				<ErrorMessage>{errors.user_agent?.message as string}</ErrorMessage>
			</div>

			<div className="relative">
				<Input
					{...register("username", { onChange: handleUsernameChange })}
					aria-label={t("placeholders.username")}
					disabled={isLoading}
					hint={t("hints.username")}
					isError={!!errors.username}
					isSensitive
					label={t("placeholders.username")}
				/>

				<ErrorMessage>{errors.username?.message as string}</ErrorMessage>
			</div>

			<div className="relative">
				<Input
					{...register("password", { onChange: handlePasswordChange })}
					aria-label={t("placeholders.password")}
					disabled={isLoading}
					hint={t("hints.password")}
					isError={!!errors.password}
					isSensitive
					label={t("placeholders.password")}
					type="password"
				/>

				<ErrorMessage>{errors.password?.message as string}</ErrorMessage>
			</div>

			<Accordion className="mt-4" title={tIntegrations("information")}>
				<div className="flex flex-col gap-2">
					{infoRedditLinks.map(({ text, url }, index) => (
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
				aria-label={tIntegrations("buttons.saveConnection")}
				className="ml-auto w-fit border-white px-3 font-medium text-white hover:bg-black"
				disabled={isLoading}
				type="submit"
				variant="outline"
			>
				{isLoading ? <Spinner /> : <FloppyDiskIcon className="size-5 fill-white transition" />}

				{tIntegrations("buttons.saveConnection")}
			</Button>
		</form>
	);
};
