import React, { useEffect } from "react";

import { Controller, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { selectIntegrationAws } from "@constants/lists/connections";
import { ModalName } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { useCacheStore, useModalStore } from "@src/store";
import { awsIntegrationSchema } from "@validations";

import { Button, ErrorMessage, Input, Spinner } from "@components/atoms";
import { Select } from "@components/molecules";
import { WarningDeploymentActivetedModal } from "@components/organisms";

import { FloppyDiskIcon } from "@assets/image/icons";

export const AwsIntegrationEditForm = () => {
	const { t } = useTranslation("integrations");

	const { connectionVariables, control, errors, handleSubmit, isLoading, onSubmitEdit, register, setValue } =
		useConnectionForm(awsIntegrationSchema, "edit");

	const { hasActiveDeployments } = useCacheStore();
	const { openModal } = useModalStore();

	const accessKey = useWatch({ control, name: "access_key" });
	const secretKey = useWatch({ control, name: "secret_key" });
	const token = useWatch({ control, name: "token" });

	useEffect(() => {
		if (!connectionVariables) return;

		const region = connectionVariables?.find((variable) => variable.name === "Region");
		if (region) {
			setValue("region", {
				label: region.value,
				value: region.value,
			});
		}
		const accessKeyValue = connectionVariables?.find((variable) => variable.name === "AccessKeyID")?.value;
		if (accessKeyValue) {
			setValue("access_key", accessKeyValue);
		}
		const secretKeyValue = connectionVariables?.find((variable) => variable.name === "SecretKey")?.value;
		if (secretKeyValue) {
			setValue("secret_key", secretKeyValue);
		}
		const tokenValue = connectionVariables?.find((variable) => variable.name === "Token")?.value;
		if (tokenValue) {
			setValue("token", tokenValue);
		}
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
				<Input
					{...register("access_key")}
					aria-label={t("aws.placeholders.accessKey")}
					isError={!!errors.access_key}
					isRequired
					label={t("aws.placeholders.accessKey")}
					onChange={(newValue) => setValue("access_key", newValue)}
					value={accessKey}
				/>
				<ErrorMessage>{errors.access_key?.message as string}</ErrorMessage>
			</div>

			<div className="relative">
				<Input
					{...register("secret_key")}
					aria-label={t("aws.placeholders.secretKey")}
					isError={!!errors.secret_key}
					isRequired
					label={t("aws.placeholders.secretKey")}
					onChange={(newValue) => setValue("secret_key", newValue)}
					value={secretKey}
				/>
				<ErrorMessage>{errors.secret_key?.message as string}</ErrorMessage>
			</div>

			<div className="relative">
				<Input
					{...register("token")}
					aria-label={t("aws.placeholders.token")}
					isError={!!errors.token}
					isRequired
					label={t("aws.placeholders.token")}
					onChange={(newValue) => setValue("token", newValue)}
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
