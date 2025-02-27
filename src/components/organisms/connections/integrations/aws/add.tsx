import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";

import { selectIntegrationAws } from "@constants/lists/connections";
import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { awsIntegrationSchema } from "@validations";

import { Button, ErrorMessage, Input, Spinner } from "@components/atoms";
import { Select } from "@components/molecules";

import { FloppyDiskIcon } from "@assets/image/icons";

export const AwsIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
	isCreatingConnection,
}: {
	connectionId?: string;
	isCreatingConnection: boolean;
	triggerParentFormSubmit: () => void;
}) => {
	const { t } = useTranslation("integrations");

	const { clearErrors, createConnection, errors, handleSubmit, isLoading, register, setValue } = useConnectionForm(
		awsIntegrationSchema,
		"create"
	);

	useEffect(() => {
		if (connectionId) {
			createConnection(connectionId, ConnectionAuthType.AWSConfig, Integrations.aws);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	return (
		<form className="flex w-full flex-col gap-6" onSubmit={handleSubmit(triggerParentFormSubmit)}>
			<div className="relative">
				<Select
					aria-label={t("aws.placeholders.region")}
					disabled={isCreatingConnection || isLoading}
					isError={!!errors.region}
					label={t("aws.placeholders.region")}
					onChange={(selectedRegion) => {
						setValue("region", selectedRegion);
						clearErrors("region");
					}}
					options={selectIntegrationAws}
					placeholder={t("aws.placeholders.region")}
				/>

				<ErrorMessage>{errors.region?.message as string}</ErrorMessage>
			</div>

			<div className="relative">
				<Input
					{...register("access_key")}
					aria-label={t("aws.placeholders.accessKey")}
					disabled={isCreatingConnection || isLoading}
					isError={!!errors.access_key}
					isRequired
					label={t("aws.placeholders.accessKey")}
				/>

				<ErrorMessage>{errors.access_key?.message as string}</ErrorMessage>
			</div>

			<div className="relative">
				<Input
					{...register("secret_key")}
					aria-label={t("aws.placeholders.secretKey")}
					disabled={isCreatingConnection || isLoading}
					isError={!!errors.secret_key}
					isRequired
					label={t("aws.placeholders.secretKey")}
				/>

				<ErrorMessage>{errors.secret_key?.message as string}</ErrorMessage>
			</div>

			<div className="relative">
				<Input
					{...register("token")}
					aria-label={t("aws.placeholders.token")}
					disabled={isCreatingConnection || isLoading}
					isError={!!errors.token}
					isRequired
					label={t("aws.placeholders.token")}
				/>

				<ErrorMessage>{errors.token?.message as string}</ErrorMessage>
			</div>

			<Button
				aria-label={t("buttons.saveConnection")}
				className="ml-auto w-fit border-white px-3 font-medium text-white hover:bg-black"
				disabled={isCreatingConnection || isLoading}
				type="submit"
				variant="outline"
			>
				{isCreatingConnection || isLoading ? (
					<Spinner />
				) : (
					<FloppyDiskIcon className="size-5 fill-white transition" />
				)}

				{t("buttons.saveConnection")}
			</Button>
		</form>
	);
};
