import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { infoAwsLinks, selectIntegrationAws } from "@constants/lists/connections";
import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { awsIntegrationSchema } from "@validations";

import { Button, ErrorMessage, Input, Spinner } from "@components/atoms";
import { Accordion, Select } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const AwsIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
}: {
	connectionId?: string;
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
					disabled={isLoading}
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
					disabled={isLoading}
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
					disabled={isLoading}
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
					disabled={isLoading}
					isError={!!errors.token}
					isRequired
					label={t("aws.placeholders.token")}
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
