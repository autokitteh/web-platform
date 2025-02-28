import React from "react";

import { Controller, FieldErrors, UseFormClearErrors, FieldValues } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { selectIntegrationLinearActor } from "@src/constants/lists/connections";

import { Button, ErrorMessage, Spinner } from "@components/atoms";
import { Select } from "@components/molecules";

export const LinearOauthForm = ({
	control,
	errors,
	isLoading,
	setValue,
	clearErrors,
}: {
	clearErrors: UseFormClearErrors<FieldValues>;
	control: any;
	errors: FieldErrors<any>;
	isLoading: boolean;
	setValue: any;
}) => {
	const { t } = useTranslation("integrations");

	return (
		<>
			<div className="relative">
				<Controller
					control={control}
					defaultValue={selectIntegrationLinearActor[0]}
					name="actor"
					render={({ field }) => (
						<Select
							{...field}
							aria-label={t("linear.placeholders.actor")}
							isError={!!errors.actor}
							label={t("linear.placeholders.actor")}
							onChange={(selected) => {
								setValue("actor", selected);
								clearErrors("actor");
							}}
							options={selectIntegrationLinearActor}
							placeholder={t("linear.placeholders.actor")}
						/>
					)}
				/>

				<ErrorMessage>{errors.actor?.message as string}</ErrorMessage>
			</div>
			<Button
				aria-label={t("buttons.startOAuthFlow")}
				className="ml-auto w-fit border-black bg-white px-3 font-medium hover:bg-gray-950 hover:text-white"
				type="submit"
				variant="outline"
			>
				{isLoading ? <Spinner /> : null}
				{t("buttons.startOAuthFlow")}
			</Button>
		</>
	);
};
