import React, { useState } from "react";

import { FieldErrors, UseFormRegister, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { infoSlackModeLinks } from "@src/constants/lists/connections";

import { Button, ErrorMessage, Input, Link, SecretInput, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const SocketForm = ({
	control,
	errors,
	isLoading,
	mode,
	register,
	setValue,
}: {
	control: any;
	errors: FieldErrors<any>;
	isLoading: boolean;
	mode: "create" | "edit";
	register: UseFormRegister<{ [x: string]: any }>;
	setValue: any;
}) => {
	const { t } = useTranslation("integrations");
	const [lockState, setLockState] = useState<{ private_app_token: boolean; private_bot_token: boolean }>({
		private_bot_token: true,
		private_app_token: true,
	});
	const isEditMode = mode === "edit";

	const botToken = useWatch({ control, name: "private_bot_token" });
	const appToken = useWatch({ control, name: "private_app_token" });

	return (
		<>
			<div className="relative">
				{isEditMode ? (
					<SecretInput
						type="password"
						{...register("private_bot_token")}
						aria-label={t("slack.placeholders.botToken")}
						disabled={isLoading}
						handleInputChange={(newValue) => setValue("private_bot_token", newValue)}
						handleLockAction={(newLockState: boolean) =>
							setLockState((prevState) => ({ ...prevState, private_bot_token: newLockState }))
						}
						isError={!!errors.private_bot_token}
						isLocked={lockState.private_bot_token}
						isRequired
						label={t("slack.placeholders.botToken")}
						value={botToken}
					/>
				) : (
					<Input
						{...register("private_bot_token")}
						aria-label={t("slack.placeholders.botToken")}
						disabled={isLoading}
						isError={!!errors.private_bot_token}
						isRequired
						isSensitive
						label={t("slack.placeholders.botToken")}
					/>
				)}
				<ErrorMessage>{errors.private_bot_token?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				{isEditMode ? (
					<SecretInput
						type="password"
						{...register("private_app_token")}
						aria-label={t("slack.placeholders.appToken")}
						disabled={isLoading}
						handleInputChange={(newValue) => setValue("private_app_token", newValue)}
						handleLockAction={(newLockState: boolean) =>
							setLockState((prevState) => ({ ...prevState, private_app_token: newLockState }))
						}
						isError={!!errors.private_app_token}
						isLocked={lockState.private_app_token}
						isRequired
						label={t("slack.placeholders.appToken")}
						value={appToken}
					/>
				) : (
					<Input
						{...register("private_app_token")}
						aria-label={t("slack.placeholders.appToken")}
						disabled={isLoading}
						isError={!!errors.private_app_token}
						isRequired
						isSensitive
						label={t("slack.placeholders.appToken")}
					/>
				)}
				<ErrorMessage>{errors.private_app_token?.message as string}</ErrorMessage>
			</div>

			<Accordion title={t("information")}>
				<div className="flex flex-col gap-2">
					{infoSlackModeLinks.map(({ text, url }, index) => (
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
				{isLoading ? <Spinner /> : <FloppyDiskIcon className="h-4 w-5 fill-white transition" />}
				{t("buttons.saveConnection")}
			</Button>
		</>
	);
};
