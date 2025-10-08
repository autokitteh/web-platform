import React from "react";

import { FieldErrors, UseFormRegister, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button, ErrorMessage, Input, Spinner } from "@components/atoms";

import { FloppyDiskIcon } from "@assets/image/icons";

export const NotionApiKeyForm = ({
	control,
	errors,
	isLoading,
	register,
}: {
	control: any;
	errors: FieldErrors<any>;
	isLoading: boolean;
	mode: "create" | "edit";
	register: UseFormRegister<{ [x: string]: any }>;
	setValue: any;
}) => {
	const { t } = useTranslation("integrations");

	const internalIntegrationSecret = useWatch({ control, name: "internal_integration_secret" });

	return (
		<>
			<div className="relative">
				<Input
					{...register("internal_integration_secret")}
					aria-label={t("notion.placeholders.internalIntegrationSecret")}
					disabled={isLoading}
					isError={!!errors.internal_integration_secret}
					isRequired
					label={t("notion.placeholders.internalIntegrationSecret")}
					value={internalIntegrationSecret}
				/>
				<ErrorMessage>{errors.internal_integration_secret?.message as string}</ErrorMessage>
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
		</>
	);
};
