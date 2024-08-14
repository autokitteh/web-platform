import React, { useState } from "react";

import { FieldErrors, UseFormRegister } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { infoSlackModeLinks } from "@src/constants/lists/connections";

import { Button, ErrorMessage, Input, SecretInput, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const SocketForm = ({
	errors,
	isLoading,
	mode,
	register,
	setValue,
}: {
	copyToClipboard: (webhookUrlPath: string) => void;
	errors: FieldErrors<any>;
	isLoading: boolean;
	mode: "create" | "edit";
	patWebhookKey?: string;
	register: UseFormRegister<{ [x: string]: any }>;
	setValue: any;
}) => {
	const { t } = useTranslation("integrations");
	const isEditMode = mode === "edit";
	const [lockState, setLockState] = useState<{ appToken: boolean; botToken: boolean }>({
		appToken: true,
		botToken: true,
	});

	return (
		<>
			<div className="relative">
				{isEditMode ? (
					<SecretInput
						{...register("bot_token")}
						aria-label={t("slack.placeholders.botToken")}
						handleInputChange={(newPatValue) => setValue("bot_token", newPatValue)}
						handleLockAction={(newLockState: boolean) =>
							setLockState((prevState) => ({ ...prevState, botToken: newLockState }))
						}
						isError={!!errors.botToken}
						isLocked={lockState.botToken}
						isRequired
						placeholder={t("slack.placeholders.botToken")}
						resetOnFirstFocus
					/>
				) : (
					<Input
						{...register("bot_token")}
						aria-label={t("slack.placeholders.botToken")}
						isError={!!errors.botToken}
						isRequired
						placeholder={t("slack.placeholders.botToken")}
					/>
				)}

				<ErrorMessage>{errors.botToken?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				{isEditMode ? (
					<SecretInput
						{...register("app_token")}
						aria-label={t("slack.placeholders.appToken")}
						handleInputChange={(newPatValue) => setValue("app_token", newPatValue)}
						handleLockAction={(newLockState: boolean) =>
							setLockState((prevState) => ({ ...prevState, appToken: newLockState }))
						}
						isError={!!errors.appToken}
						isLocked={lockState.appToken}
						isRequired
						placeholder={t("slack.placeholders.appToken")}
						resetOnFirstFocus
					/>
				) : (
					<Input
						{...register("app_token")}
						aria-label={t("slack.placeholders.appToken")}
						isError={!!errors.appToken}
						isRequired
						placeholder={t("slack.placeholders.appToken")}
					/>
				)}

				<ErrorMessage>{errors.appToken?.message as string}</ErrorMessage>
			</div>
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

							<ExternalLinkIcon className="h-3.5 w-3.5 fill-green-800 duration-200" />
						</Link>
					))}
				</div>
			</Accordion>
		</>
	);
};
