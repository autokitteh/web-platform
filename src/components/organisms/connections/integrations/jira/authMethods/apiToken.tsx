import React from "react";

import { FieldErrors, UseFormRegister } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { infoTwilioLinks } from "@constants/lists/connections";

import { Button, ErrorMessage, Input, Link, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const ApiTokenJiraForm = ({
	errors,
	isLoading,
	register,
}: {
	errors: FieldErrors<any>;
	isLoading: boolean;
	mode: "create" | "edit";
	register: UseFormRegister<{ [x: string]: any }>;
	setValue: any;
}) => {
	const { t } = useTranslation("integrations");

	return (
		<>
			<div className="relative">
				<Input
					{...register("base_url")}
					aria-label={t("jira.placeholders.baseUrl")}
					isError={!!errors.base_url}
					isRequired
					label={t("jira.placeholders.baseUrl")}
					placeholder={t("jira.placeholders.exampleUrl")}
				/>

				<ErrorMessage>{errors.base_url?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				<Input
					{...register("token")}
					aria-label={t("jira.placeholders.pat")}
					isError={!!errors.token}
					isRequired
					label={t("jira.placeholders.pat")}
				/>

				<ErrorMessage>{errors.token?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				<Input
					{...register("email")}
					aria-label={t("jira.placeholders.email")}
					isError={!!errors.email}
					label={t("jira.placeholders.email")}
					placeholder="name@exemple.com"
					type="email"
				/>

				<ErrorMessage>{errors.email?.message as string}</ErrorMessage>
			</div>

			<Button
				aria-label={t("buttons.saveConnection")}
				className="ml-auto w-fit border-white px-3 font-medium text-white hover:bg-black"
				disabled={isLoading}
				type="submit"
				variant="outline"
			>
				{isLoading ? <Spinner /> : <FloppyDiskIcon className="h-5 w-5 fill-white transition" />}

				{t("buttons.saveConnection")}
			</Button>
			<Accordion title={t("information")}>
				<div className="flex flex-col gap-2">
					{infoTwilioLinks.map(({ text, url }, index) => (
						<Link
							className="group inline-flex items-center gap-2.5 text-green-800"
							key={index}
							target="_blank"
							to={url}
						>
							{text}

							<ExternalLinkIcon className="h-3.5 w-3.5 fill-green-800 duration-200" />
						</Link>
					))}
				</div>
			</Accordion>
		</>
	);
};
