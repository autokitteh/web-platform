import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { ConnectionAuthType } from "@enums";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { azureBotIntegrationSchema } from "@validations";

import { Button, ErrorMessage, Input, SecretInput, Spinner } from "@components/atoms";

export const AzureBotIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
	type,
}: {
	connectionId?: string;
	triggerParentFormSubmit: () => void;
	type: string;
}) => {
	const { createConnection, errors, handleSubmit, isLoading, register, setValue } = useConnectionForm(
		azureBotIntegrationSchema,
		"create"
	);

	const [lockState, setLockState] = useState({
		app_password: true,
		tenant_id: true,
	});

	const handleLockAction = (fieldName: string, newLockState: boolean) => {
		setLockState((prev) => ({ ...prev, [fieldName]: newLockState }));
	};

	const configureConnection = async (connectionId: string) => {
		await createConnection(connectionId, ConnectionAuthType.Initialized, Integrations.azurebot);
	};

	useEffect(() => {
		setValue("auth_scopes", type);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [type]);

	useEffect(() => {
		if (connectionId) {
			configureConnection(connectionId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	const { t } = useTranslation("integrations");

	return (
		<form className="mt-6 flex flex-col gap-6" onSubmit={handleSubmit(triggerParentFormSubmit)}>
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
					{...register("app_password")}
					aria-label={t("azurebot.placeholders.appPassword")}
					disabled={isLoading}
					handleInputChange={(newValue) => setValue("app_password", newValue)}
					handleLockAction={(newLockState) => handleLockAction("app_password", newLockState)}
					isError={!!errors.app_password}
					isLocked={lockState.app_password}
					isRequired
					label={t("azurebot.placeholders.appPassword")}
					type="password"
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
				className="ml-auto w-fit border-black bg-white px-3 font-medium hover:bg-gray-950 hover:text-white"
				type="submit"
				variant="outline"
			>
				{isLoading ? <Spinner /> : null}
				{t("buttons.saveConnection")}
			</Button>
		</form>
	);
};
