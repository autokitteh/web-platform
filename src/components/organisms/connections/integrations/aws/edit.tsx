import React, { useEffect, useState } from "react";

import { Controller, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { infoAwsLinks, selectIntegrationAws } from "@constants/lists/connections";
import { integrationVariablesMapping } from "@src/constants";
import { useConnectionForm } from "@src/hooks";
import { setFormValues } from "@src/utilities";
import { awsIntegrationSchema } from "@validations";

import { Button, ErrorMessage, SecretInput, Spinner } from "@components/atoms";
import { Accordion, Select } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const AwsIntegrationEditForm = () => {
	const { t } = useTranslation("integrations");
	const [lockState, setLockState] = useState({
		access_key: true,
		secret_key: true,
		token: true,
	});
	const { connectionVariables, control, errors, handleSubmit, isLoading, onSubmitEdit, register, setValue } =
		useConnectionForm(awsIntegrationSchema, "edit");

	const accessKey = useWatch({ control, name: "access_key" });
	const secretKey = useWatch({ control, name: "secret_key" });
	const token = useWatch({ control, name: "token" });

	useEffect(() => {
		setFormValues(connectionVariables, integrationVariablesMapping.aws, setValue);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionVariables]);

	return (
		<form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmitEdit)}>
			<div className="relative">
				<Controller
					control={control}
					name="region"
					render={({ field }) => (
						<Select
							{...field}
							aria-label={t("aws.placeholders.region")}
							disabled={isLoading}
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
					disabled={isLoading}
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
					disabled={isLoading}
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
					disabled={isLoading}
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

			<Accordion title={t("information")}>
				<div className="flex flex-col gap-2">
					{infoAwsLinks.map(({ text, url }, index: number) => (
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
				{isLoading ? <Spinner /> : <FloppyDiskIcon className="size-5 fill-white transition" />}
				{t("buttons.saveConnection")}
			</Button>
		</form>
	);
};
