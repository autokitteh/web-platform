import React from "react";

import { Controller, FieldErrors, UseFormClearErrors, FieldValues } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { infoLinearDefaultOAuthLinks, selectIntegrationLinearActor } from "@constants/lists/connections";

import { Button, ErrorMessage, Spinner } from "@components/atoms";
import { Select, Accordion } from "@components/molecules";

import { ExternalLinkIcon } from "@assets/image/icons";

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
							disabled={isLoading}
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

			<Accordion title={t("information")}>
				<div className="flex flex-col gap-2">
					{infoLinearDefaultOAuthLinks.map(({ text, url }, index) => (
						<Link
							className="inline-flex items-center gap-2.5 text-green-800"
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
				aria-label={t("buttons.startOAuthFlow")}
				className="ml-auto w-fit border-white px-3 font-medium text-white hover:bg-black"
				disabled={isLoading}
				type="submit"
				variant="outline"
			>
				{isLoading ? <Spinner /> : <ExternalLinkIcon className="size-4 fill-white transition" />}
				{t("buttons.startOAuthFlow")}
			</Button>
		</>
	);
};
