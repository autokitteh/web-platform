import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { selectIntegrationAws } from "@constants/lists/connections";
import { useConnectionForm } from "@src/hooks";
import { awsIntegrationSchema } from "@validations";

import { Button, ErrorMessage, SecretInput, Spinner } from "@components/atoms";
import { Select } from "@components/molecules";

import { FloppyDiskIcon } from "@assets/image/icons";

export const AwsIntegrationEditForm = () => {
	const { t } = useTranslation("integrations");
	const [lockState, setLockState] = useState<{ access_key: boolean; secret_key: boolean; token: boolean }>({
		access_key: true,
		secret_key: true,
		token: true,
	});

	const { connectionType, errors, handleSubmit, isLoading, onSubmitEdit, register, setValue } = useConnectionForm(
		{ access_key: "", secret_key: "", token: "", region: { label: "", value: "" } },
		awsIntegrationSchema,
		"edit"
	);

	const selectConnectionTypeValue = selectIntegrationAws.find((method) => method.value === connectionType);

	useEffect(() => {
		if (!selectConnectionTypeValue) return;

		setValue("region", selectConnectionTypeValue);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectConnectionTypeValue]);

	return (
		<form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmitEdit)}>
			<div className="relative">
				<Select
					aria-label={t("aws.placeholders.region")}
					disabled
					isError={!!errors.region}
					label={t("aws.placeholders.region")}
					options={selectIntegrationAws}
					placeholder={t("aws.placeholders.region")}
					value={selectConnectionTypeValue}
				/>

				<ErrorMessage>{errors.region?.message as string}</ErrorMessage>
			</div>

			<div className="relative">
				<SecretInput
					{...register("access_key")}
					aria-label={t("aws.placeholders.accessKey")}
					handleInputChange={(newValue) => setValue("access_key", newValue)}
					handleLockAction={(newLockState: boolean) =>
						setLockState((prevState) => ({ ...prevState, access_key: newLockState }))
					}
					isError={!!errors.access_key}
					isLocked={lockState.access_key}
					isRequired
					placeholder={t("aws.placeholders.accessKey")}
					resetOnFirstFocus
				/>

				<ErrorMessage>{errors.access_key?.message as string}</ErrorMessage>
			</div>

			<div className="relative">
				<SecretInput
					{...register("secret_key")}
					aria-label={t("aws.placeholders.secretKey")}
					handleInputChange={(newValue) => setValue("secret_key", newValue)}
					handleLockAction={(newLockState: boolean) =>
						setLockState((prevState) => ({ ...prevState, secret_key: newLockState }))
					}
					isError={!!errors.secret_key}
					isLocked={lockState.secret_key}
					isRequired
					placeholder={t("aws.placeholders.secretKey")}
					resetOnFirstFocus
				/>

				<ErrorMessage>{errors.secret_key?.message as string}</ErrorMessage>
			</div>

			<div className="relative">
				<SecretInput
					{...register("token")}
					aria-label={t("aws.placeholders.token")}
					handleInputChange={(newValue) => setValue("token", newValue)}
					handleLockAction={(newLockState: boolean) =>
						setLockState((prevState) => ({ ...prevState, token: newLockState }))
					}
					isError={!!errors.token}
					isLocked={lockState.token}
					isRequired
					placeholder={t("aws.placeholders.token")}
					resetOnFirstFocus
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
				{isLoading ? <Spinner /> : <FloppyDiskIcon className="h-5 w-5 fill-white transition" />}

				{t("buttons.saveConnection")}
			</Button>
		</form>
	);
};
