import React, { useState } from "react";

import { useTranslation } from "react-i18next";

import { useConnectionForm } from "@src/hooks";
import { azureBotIntegrationSchema } from "@validations";

import { Button, ErrorMessage, Input, SecretInput, Spinner } from "@components/atoms";

import { FloppyDiskIcon } from "@assets/image/icons";

const initialLockState: Record<string, boolean> = {
	app_password: true,
	tenant_id: true,
};

export const AzureBotIntegrationEditForm = () => {
	const { t } = useTranslation("integrations");
	const [lockState, setLockState] = useState(initialLockState);

	const { errors, handleSubmit, isLoading, onSubmitEdit, register, setValue } = useConnectionForm(
		azureBotIntegrationSchema,
		"edit"
	);

	const handleLockAction = (fieldName: string, newLockState: boolean) => {
		setLockState((prev) => ({ ...prev, [fieldName]: newLockState }));
	};

	// Removed useEffect to not pre-populate values - just show clean form with labels

	return (
		<form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmitEdit)}>
			<div className="relative">
				<Input
					{...register("app_id")}
					aria-label={t("azurebot.placeholders.appId")}
					disabled={isLoading}
					isError={!!errors.app_id}
					isRequired
					label={t("azurebot.placeholders.appId")}
				/>
				<ErrorMessage>{errors.app_id?.message as string}</ErrorMessage>
			</div>

			<div className="relative">
				<SecretInput
					type="password"
					{...register("app_password")}
					aria-label={t("azurebot.placeholders.appPassword")}
					disabled={isLoading}
					handleInputChange={(newValue) => setValue("app_password", newValue)}
					handleLockAction={(newLockState) => handleLockAction("app_password", newLockState)}
					isError={!!errors.app_password}
					isLocked={lockState.app_password}
					isRequired
					label={t("azurebot.placeholders.appPassword")}
				/>
				<ErrorMessage>{errors.app_password?.message as string}</ErrorMessage>
			</div>

			<div className="relative">
				<SecretInput
					type="password"
					{...register("tenant_id")}
					aria-label={t("azurebot.placeholders.tenantId")}
					disabled={isLoading}
					handleInputChange={(newValue) => setValue("tenant_id", newValue)}
					handleLockAction={(newLockState) => handleLockAction("tenant_id", newLockState)}
					isError={!!errors.tenant_id}
					isLocked={lockState.tenant_id}
					isRequired
					label={t("azurebot.placeholders.tenantId")}
				/>
				<ErrorMessage>{errors.tenant_id?.message as string}</ErrorMessage>
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
