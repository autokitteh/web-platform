import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { telegramIntegrationSchema } from "@validations";

import { useToastStore } from "@store";

import { Button, ErrorMessage, IconSvg, Input, Loader, Spinner } from "@components/atoms";

import { FloppyDiskIcon, CheckboxEmpty, CheckboxChecked, CheckboxFailed } from "@assets/image/icons";

type ValidationStatus = "idle" | "validating" | "valid" | "invalid";

interface TelegramIntegrationAddFormProps {
	connectionId?: string;
	triggerParentFormSubmit: () => void;
	type?: string;
}

export const TelegramIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
}: TelegramIntegrationAddFormProps) => {
	const { t } = useTranslation("integrations");
	const addToast = useToastStore((state) => state.addToast);

	const { createConnection, errors, handleSubmit, isLoading, register, watch } = useConnectionForm(
		telegramIntegrationSchema,
		"create"
	);

	const [validationStatus, setValidationStatus] = useState<ValidationStatus>("idle");
	const [validationError, setValidationError] = useState<string | null>(null);

	const botToken = watch("bot_token");

	useEffect(() => {
		if (connectionId) {
			createConnection(connectionId, ConnectionAuthType.Key, Integrations.telegram);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	const validateBotToken = async () => {
		if (!botToken) {
			setValidationError(t("telegram.errorEmptyToken"));
			return;
		}

		try {
			setValidationStatus("validating");
			setValidationError(null);

			const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);

			if (response.ok) {
				setValidationStatus("valid");
				addToast({
					message: t("telegram.botTokenValidated"),
					type: "success",
				});
			} else {
				setValidationStatus("invalid");
				const errorData = await response.json();
				const errorMessage = errorData?.description || t("telegram.invalidBotToken");
				setValidationError(errorMessage);
				addToast({
					message: t("telegram.validationFailed"),
					type: "error",
				});
			}
		} catch (error: any) {
			setValidationStatus("invalid");
			const errorMessage = error?.message || t("telegram.invalidBotToken");
			setValidationError(errorMessage);
			addToast({
				message: t("telegram.validationFailed"),
				type: "error",
			});
		}
	};

	const onSubmit = async () => {
		if (validationStatus !== "valid") {
			addToast({
				message: t("telegram.pleaseValidateToken"),
				type: "error",
			});
			return;
		}
		triggerParentFormSubmit();
	};

	return (
		<form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
			<div className="relative">
				<Input
					{...register("bot_token")}
					aria-label={t("telegram.botToken")}
					disabled={isLoading}
					isRequired
					label={t("telegram.botToken")}
					placeholder={t("telegram.enterBotToken")}
				/>
				<ErrorMessage>{errors.bot_token?.message as string}</ErrorMessage>
				{validationError && !errors.bot_token?.message ? <ErrorMessage>{validationError}</ErrorMessage> : null}
			</div>

			<div className="flex items-center justify-end gap-4">
				<Button
					aria-label={t("telegram.validate")}
					className="flex w-fit items-center gap-2 border border-gray-750 px-3 font-medium text-white hover:border-white hover:bg-black"
					disabled={isLoading}
					onClick={validateBotToken}
					type="button"
					variant="outline"
				>
					{validationStatus === "idle" ? <IconSvg size="md" src={CheckboxEmpty} /> : null}
					{validationStatus === "validating" ? <Loader size="sm" /> : null}
					{validationStatus === "valid" ? <IconSvg size="md" src={CheckboxChecked} /> : null}
					{validationStatus === "invalid" ? <IconSvg size="md" src={CheckboxFailed} /> : null}
					{t("telegram.validate")}
				</Button>

				<Button
					aria-label={t("buttons.saveConnection")}
					className="w-fit border-white px-3 font-medium text-white hover:bg-black"
					disabled={isLoading}
					type="submit"
					variant="filled"
				>
					{isLoading ? <Spinner /> : <IconSvg className="fill-white" src={FloppyDiskIcon} />}
					{t("buttons.saveConnection")}
				</Button>
			</div>
		</form>
	);
};

export default TelegramIntegrationAddForm;
