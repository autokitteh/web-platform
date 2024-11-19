import React, { useEffect, useState } from "react";

import { Controller, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { selectIntegrationAws } from "@constants/lists/connections";
import { integrationVariablesMapping } from "@src/constants";
import { ModalName } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { useCacheStore, useModalStore } from "@src/store";
import { setFormValues } from "@src/utilities";
import { awsIntegrationSchema } from "@validations";

import { Button, ErrorMessage, SecretInput, Spinner } from "@components/atoms";
import { Select } from "@components/molecules";
import { WarningDeploymentActivetedModal } from "@components/organisms";

import { FloppyDiskIcon } from "@assets/image/icons";

export const AwsIntegrationEditForm = () => {
	const { t } = useTranslation("integrations");
	const [lockState, setLockState] = useState({
		access_key: true,
		secret_key: true,
		token: true,
	});
	const { connectionVariables, control, errors, handleSubmit, isLoading, onSubmitEdit, register, setValue } =
		useConnectionForm(awsIntegrationSchema, "edit");

	const { hasActiveDeployments } = useCacheStore();
	const { openModal } = useModalStore();

	const accessKey = useWatch({ control, name: "access_key" });
	const secretKey = useWatch({ control, name: "secret_key" });
	const token = useWatch({ control, name: "token" });

	useEffect(() => {
		if (!connectionVariables) return;
		setFormValues(connectionVariables, integrationVariablesMapping.aws, setValue);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionVariables]);

	const handleFormSubmit = () => {
		if (hasActiveDeployments) {
			openModal(ModalName.warningDeploymentActive);

			return;
		}
		onSubmitEdit();
	};

	return (
		<form className="flex flex-col gap-4" onSubmit={handleSubmit(handleFormSubmit)}>
			<div className="relative">
				<Controller
					control={control}
					name="region"
					render={({ field }) => (
						<Select
							{...field}
							aria-label={t("aws.placeholders.region")}
							isError={!!errors.region}
							label={t("aws.placeholders.region")}
							options={selectIntegrationAws}
							placeholder={t("aws.placeholders.region")}
						/>
					)}
				/>
				<ErrorMessage>{errors.region?.message as string}</ErrorMessage>
			</div>

			<div className="relative">
				<SecretInput
					type="password"
					{...register("access_key")}
					aria-label={t("aws.placeholders.accessKey")}
					handleInputChange={(newValue) => setValue("access_key", newValue)}
					handleLockAction={(newLockState: boolean) =>
						setLockState((prevState) => ({ ...prevState, access_key: newLockState }))
					}
					isError={!!errors.access_key}
					isLocked={lockState.access_key}
					isRequired
					label={t("aws.placeholders.accessKey")}
					value={accessKey}
				/>
				<ErrorMessage>{errors.access_key?.message as string}</ErrorMessage>
			</div>

			<div className="relative">
				<SecretInput
					type="password"
					{...register("secret_key")}
					aria-label={t("aws.placeholders.secretKey")}
					handleInputChange={(newValue) => setValue("secret_key", newValue)}
					handleLockAction={(newLockState: boolean) =>
						setLockState((prevState) => ({ ...prevState, secret_key: newLockState }))
					}
					isError={!!errors.secret_key}
					isLocked={lockState.secret_key}
					isRequired
					label={t("aws.placeholders.secretKey")}
					value={secretKey}
				/>

				<ErrorMessage>{errors.secret_key?.message as string}</ErrorMessage>
			</div>

			<div className="relative">
				<SecretInput
					type="password"
					{...register("token")}
					aria-label={t("aws.placeholders.token")}
					handleInputChange={(newValue) => setValue("token", newValue)}
					handleLockAction={(newLockState: boolean) =>
						setLockState((prevState) => ({ ...prevState, token: newLockState }))
					}
					isError={!!errors.token}
					isLocked={lockState.token}
					isRequired
					label={t("aws.placeholders.token")}
					value={token}
				/>

				<ErrorMessage>{errors.token?.message as string}</ErrorMessage>
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

			<WarningDeploymentActivetedModal onClick={onSubmitEdit} />
		</form>
	);
};
