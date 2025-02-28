import React from "react";

import { FieldErrors, UseFormRegister, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button, ErrorMessage, Input, Spinner } from "@components/atoms";

export const HeightApiKeyForm = ({
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

	const apiKey = useWatch({ control, name: "api_key" });

	return (
		<>
			<div className="relative">
				<Input
					{...register("api_key")}
					aria-label={t("height.placeholders.apiKey")}
					isError={!!errors.api_key}
					isRequired
					label={t("height.placeholders.apiKey")}
					value={apiKey}
				/>
				<ErrorMessage>{errors.api_key?.message as string}</ErrorMessage>
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
		</>
	);
};
