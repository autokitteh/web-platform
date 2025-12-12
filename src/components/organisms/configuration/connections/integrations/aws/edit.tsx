import React, { useState } from "react";

import { Controller, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { selectIntegrationAws } from "@constants/lists/connections";
import { useConnectionForm } from "@src/hooks";
import { awsIntegrationSchema } from "@validations";

import { Button, ErrorMessage, SecretInput, Spinner } from "@components/atoms";
import { Select } from "@components/molecules";

import { FloppyDiskIcon } from "@assets/image/icons";

export const AwsIntegrationEditForm = () => {
	const { t } = useTranslation("integrations");
	const [lockState, setLockState] = useState({
		AccessKeyID: true,
		SecretKey: true,
		Token: true,
	});
	const { control, errors, handleSubmit, isLoading, onSubmitEdit, register, setValue } = useConnectionForm(
		awsIntegrationSchema,
		"edit"
	);

	const accessKey = useWatch({ control, name: "AccessKeyID" });
	const secretKey = useWatch({ control, name: "SecretKey" });
	const token = useWatch({ control, name: "Token" });

	return (
		<form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmitEdit)}>
			<div className="relative">
				<Controller
					control={control}
					name="Region"
					render={({ field }) => (
						<Select
							{...field}
							aria-label={t("aws.placeholders.region")}
							disabled={isLoading}
							isError={!!errors.Region}
							label={t("aws.placeholders.region")}
							options={selectIntegrationAws}
							placeholder={t("aws.placeholders.region")}
						/>
					)}
				/>
				<ErrorMessage>{errors.Region?.message as string}</ErrorMessage>
			</div>

			<div className="relative">
				<SecretInput
					type="password"
					{...register("AccessKeyID")}
					aria-label={t("aws.placeholders.accessKey")}
					disabled={isLoading}
					handleInputChange={(newValue) => setValue("AccessKeyID", newValue)}
					handleLockAction={(newLockState: boolean) =>
						setLockState((prevState) => ({ ...prevState, AccessKeyID: newLockState }))
					}
					isError={!!errors.AccessKeyID}
					isLocked={lockState.AccessKeyID}
					isRequired
					label={t("aws.placeholders.accessKey")}
					value={accessKey}
				/>
				<ErrorMessage>{errors.AccessKeyID?.message as string}</ErrorMessage>
			</div>

			<div className="relative">
				<SecretInput
					type="password"
					{...register("SecretKey")}
					aria-label={t("aws.placeholders.secretKey")}
					disabled={isLoading}
					handleInputChange={(newValue) => setValue("SecretKey", newValue)}
					handleLockAction={(newLockState: boolean) =>
						setLockState((prevState) => ({ ...prevState, SecretKey: newLockState }))
					}
					isError={!!errors.SecretKey}
					isLocked={lockState.SecretKey}
					isRequired
					label={t("aws.placeholders.secretKey")}
					value={secretKey}
				/>

				<ErrorMessage>{errors.SecretKey?.message as string}</ErrorMessage>
			</div>

			<div className="relative">
				<SecretInput
					type="password"
					{...register("Token")}
					aria-label={t("aws.placeholders.token")}
					disabled={isLoading}
					handleInputChange={(newValue) => setValue("Token", newValue)}
					handleLockAction={(newLockState: boolean) =>
						setLockState((prevState) => ({ ...prevState, Token: newLockState }))
					}
					isError={!!errors.Token}
					isLocked={lockState.Token}
					isRequired
					label={t("aws.placeholders.token")}
					value={token}
				/>

				<ErrorMessage>{errors.Token?.message as string}</ErrorMessage>
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
