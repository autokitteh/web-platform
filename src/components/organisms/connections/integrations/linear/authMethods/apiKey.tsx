import React, { useState } from "react";

import { FieldErrors, UseFormRegister, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button, ErrorMessage, Input, SecretInput, Spinner } from "@components/atoms";

export const LinearApiKeyForm = ({
	control,
	errors,
	isLoading,
	mode,
	register,
	setValue,
}: {
	control: any;
	errors: FieldErrors<any>;
	isLoading: boolean;
	mode: "create" | "edit";
	register: UseFormRegister<{ [x: string]: any }>;
	setValue: any;
}) => {
	const { t } = useTranslation("integrations");
	const [lockState, setLockState] = useState<{ apiKey: boolean }>({
		apiKey: true,
	});

	const apiKey = useWatch({ control, name: "api_key" });
	const isEditMode = mode === "edit";

	return (
		<>
			<div className="relative">
				{isEditMode ? (
					<SecretInput
						type="password"
						{...register("api_key")}
						aria-label={t("linear.placeholders.apiKey")}
						disabled={isLoading}
						handleInputChange={(newValue) => setValue("api_key", newValue)}
						handleLockAction={(newLockState) =>
							setLockState((prevState) => ({ ...prevState, apiKey: newLockState }))
						}
						isError={!!errors.api_key}
						isLocked={lockState.apiKey}
						isRequired
						label={t("linear.placeholders.apiKey")}
						value={apiKey}
					/>
				) : (
					<Input
						{...register("api_key")}
						aria-label={t("linear.placeholders.apiKey")}
						isError={!!errors.api_key}
						isRequired
						label={t("linear.placeholders.apiKey")}
						value={apiKey}
					/>
				)}

				<ErrorMessage>{errors.api_key?.message as string}</ErrorMessage>
			</div>

			<Button
				aria-label={t("buttons.saveConnection")}
				className="ml-auto w-fit border-black bg-white px-3 font-medium hover:bg-gray-950 hover:text-white"
				disabled={isLoading}
				type="submit"
				variant="outline"
			>
				{isLoading ? <Spinner /> : null}
				{t("buttons.saveConnection")}
			</Button>
		</>
	);
};
