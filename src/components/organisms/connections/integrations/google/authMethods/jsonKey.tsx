import React from "react";

import { FieldErrors, UseFormRegister } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { infoGoogleAccountLinks } from "@constants/lists";

import { Button, ErrorMessage, Link, Spinner, Textarea } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const JsonKeyGoogleForm = ({
	errors,
	isLoading,
	register,
}: {
	errors: FieldErrors<any>;
	isLoading: boolean;
	register: UseFormRegister<{ [x: string]: any }>;
}) => {
	const { t } = useTranslation("integrations");

	return (
		<>
			<div className="relative mb-3">
				<Textarea
					rows={5}
					{...register("json")}
					aria-label={t("google.placeholders.jsonKey")}
					isError={!!errors.json}
					placeholder={t("google.placeholders.jsonKey")}
				/>

				<ErrorMessage>{errors.json?.message as string}</ErrorMessage>
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

			<Accordion title={t("information")}>
				<div className="flex flex-col items-start gap-2">
					{infoGoogleAccountLinks.map(({ text, url }, index) => (
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
		</>
	);
};