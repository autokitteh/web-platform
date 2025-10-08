import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";

import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { redditPrivateAuthIntegrationSchema } from "@validations";

import { Button, ErrorMessage, Input, Spinner } from "@components/atoms";

import { FloppyDiskIcon } from "@assets/image/icons";

export const RedditIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
}: {
	connectionId?: string;
	triggerParentFormSubmit: () => void;
}) => {
	const { t } = useTranslation("integrations");

	const { createConnection, errors, handleSubmit, isLoading, register } = useConnectionForm(
		redditPrivateAuthIntegrationSchema,
		"create"
	);

	useEffect(() => {
		if (connectionId) {
			createConnection(connectionId, ConnectionAuthType.OauthPrivate, Integrations.reddit);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	return (
		<form className="flex w-full flex-col gap-6" onSubmit={handleSubmit(triggerParentFormSubmit)}>
			<div className="relative">
				<Input
					{...register("client_id")}
					aria-label={t("reddit.placeholders.clientId")}
					disabled={isLoading}
					isError={!!errors.client_id}
					isRequired
					label={t("reddit.placeholders.clientId")}
				/>

				<ErrorMessage>{errors.client_id?.message as string}</ErrorMessage>
			</div>

			<div className="relative">
				<Input
					{...register("client_secret")}
					aria-label={t("reddit.placeholders.clientSecret")}
					disabled={isLoading}
					isError={!!errors.client_secret}
					isRequired
					label={t("reddit.placeholders.clientSecret")}
				/>

				<ErrorMessage>{errors.client_secret?.message as string}</ErrorMessage>
			</div>

			<div className="relative">
				<Input
					{...register("user_agent")}
					aria-label={t("reddit.placeholders.userAgent")}
					disabled={isLoading}
					isError={!!errors.user_agent}
					isRequired
					label={t("reddit.placeholders.userAgent")}
				/>

				<ErrorMessage>{errors.user_agent?.message as string}</ErrorMessage>
			</div>

			<div className="relative">
				<Input
					{...register("username")}
					aria-label={t("reddit.placeholders.username")}
					disabled={isLoading}
					isError={!!errors.username}
					label={t("reddit.placeholders.username")}
				/>

				<ErrorMessage>{errors.username?.message as string}</ErrorMessage>
			</div>

			<div className="relative">
				<Input
					{...register("password")}
					aria-label={t("reddit.placeholders.password")}
					disabled={isLoading}
					isError={!!errors.password}
					label={t("reddit.placeholders.password")}
					type="password"
				/>

				<ErrorMessage>{errors.password?.message as string}</ErrorMessage>
			</div>

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
