import React, { useState } from "react";

import { useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { infoRedditLinks } from "@constants/lists";
import { IntegrationEditFormProps } from "@interfaces/components";
import { useConnectionForm, useCrossFieldValidation } from "@src/hooks";
import { redditPrivateAuthIntegrationSchema } from "@validations";

import { Button, ErrorMessage, Input, Link, SecretInput, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const RedditIntegrationEditForm = ({ editedConnectionName }: IntegrationEditFormProps) => {
	const { t } = useTranslation("integrations", { keyPrefix: "reddit" });
	const { t: tIntegrations } = useTranslation("integrations");
	const [lockState, setLockState] = useState({
		client_secret: true,
		password: true,
	});
	const {
		control,
		errors,
		handleSubmit,
		isLoading,
		onSubmitEdit,
		register,
		setValue,
		trigger,
		updateConnectionName,
	} = useConnectionForm(redditPrivateAuthIntegrationSchema, "edit");

	const clientId = useWatch({ control, name: "client_id" });
	const clientSecret = useWatch({ control, name: "client_secret" });
	const userAgent = useWatch({ control, name: "user_agent" });
	const username = useWatch({ control, name: "username" });
	const password = useWatch({ control, name: "password" });

	const handleUsernameChange = useCrossFieldValidation(trigger, ["password"]);
	const handlePasswordChange = useCrossFieldValidation(trigger, ["username"]);

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
				<Input
					{...register("client_id")}
					aria-label={t("placeholders.clientId")}
					disabled={isLoading}
					isError={!!errors.client_id}
					isRequired
					isSensitive
					label={t("placeholders.clientId")}
					value={clientId}
				/>
				<ErrorMessage>{errors.client_id?.message as string}</ErrorMessage>
			</div>

			<div className="relative">
				<SecretInput
					type="password"
					{...register("client_secret")}
					aria-label={t("placeholders.clientSecret")}
					disabled={isLoading}
					handleInputChange={(newValue) => setValue("client_secret", newValue)}
					handleLockAction={(newLockState: boolean) =>
						setLockState((prevState) => ({
							...prevState,
							client_secret: newLockState,
						}))
					}
					isError={!!errors.client_secret}
					isLocked={lockState.client_secret}
					isRequired
					label={t("placeholders.clientSecret")}
					value={clientSecret}
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
					value={userAgent}
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
					value={username}
				/>

				<ErrorMessage>{errors.username?.message as string}</ErrorMessage>
			</div>

			<div className="relative">
				<SecretInput
					type="password"
					{...register("password", { onChange: handlePasswordChange })}
					aria-label={t("placeholders.password")}
					disabled={isLoading}
					handleInputChange={(newValue) => {
						setValue("password", newValue);
						handlePasswordChange();
					}}
					handleLockAction={(newLockState: boolean) =>
						setLockState((prevState) => ({
							...prevState,
							password: newLockState,
						}))
					}
					hint={t("hints.password")}
					isError={!!errors.password}
					isLocked={lockState.password}
					label={t("placeholders.password")}
					value={password}
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
