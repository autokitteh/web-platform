import React from "react";

import { FieldErrors, UseFormRegister, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { infoJiraLinks } from "@constants/lists/connections";

import { Button, ErrorMessage, Input, Link, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const ApiTokenJiraForm = ({
	control,
	errors,
	isLoading,
	register,
	setValue,
}: {
	control: any;
	errors: FieldErrors<any>;
	isLoading: boolean;
	register: UseFormRegister<{ [x: string]: any }>;
	setValue: any;
}) => {
	const { t } = useTranslation("integrations");

	const baseUrl = useWatch({ control, name: "base_url" });
	const token = useWatch({ control, name: "token" });
	const email = useWatch({ control, name: "email" });

	return (
		<>
			<div className="relative">
				<Input
					{...register("base_url")}
					aria-label={t("jira.placeholders.baseUrl")}
					isError={!!errors.base_url}
					isRequired
					label={t("jira.placeholders.baseUrl")}
					onChange={(newValue) => setValue("base_url", newValue)}
					placeholder={t("jira.placeholders.exampleUrl")}
					value={baseUrl}
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
					onChange={(newValue) => setValue("token", newValue)}
					value={token}
				/>
				<ErrorMessage>{errors.token?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				<Input
					{...register("email")}
					aria-label={t("jira.placeholders.email")}
					isError={!!errors.email}
					label={t("jira.placeholders.email")}
					onChange={(newValue) => setValue("email", newValue)}
					placeholder="name@example.com"
					type="email"
					value={email}
				/>
				<ErrorMessage>{errors.email?.message as string}</ErrorMessage>
			</div>

			<Accordion title={t("information")}>
				<div className="flex flex-col gap-2">
					{infoJiraLinks.map(({ text, url }, index) => (
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
		</>
	);
};
