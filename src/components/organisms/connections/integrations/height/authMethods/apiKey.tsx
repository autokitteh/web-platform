import React from "react";

import { FieldErrors, UseFormRegister, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { infoHeightLinks } from "@constants/lists/connections";

import { Button, ErrorMessage, Input, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

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
					disabled={isLoading}
					isError={!!errors.api_key}
					isRequired
					label={t("height.placeholders.apiKey")}
					value={apiKey}
				/>
				<ErrorMessage>{errors.api_key?.message as string}</ErrorMessage>
			</div>

			<Accordion title={t("information")}>
				<div className="flex flex-col gap-2">
					{infoHeightLinks.map(({ text, url }, index: number) => (
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
