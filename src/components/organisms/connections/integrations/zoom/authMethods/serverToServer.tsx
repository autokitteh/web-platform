import React from "react";

import { FieldErrors, UseFormRegister, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button, ErrorMessage, Input, Spinner } from "@components/atoms";

export const ZoomServerToServerForm = ({
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

	const secretToken = useWatch({ control, name: "secret_token" });

	return (
		<>
			<div className="relative">
				<Input
					{...register("secret_token")}
					aria-label={t("zoom.placeholders.secretToken")}
					isError={!!errors.secret_token}
					isRequired
					label={t("zoom.placeholders.secretToken")}
					value={secretToken}
				/>
				<ErrorMessage>{errors.secret_token?.message as string}</ErrorMessage>
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
