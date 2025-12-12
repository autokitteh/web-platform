import React, { useState } from "react";

import { FieldErrors, UseFormRegister, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { infoJiraLinks } from "@constants/lists/connections";

import { Button, ErrorMessage, Input, Link, SecretInput, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const ApiTokenJiraForm = ({
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
	const [lockState, setLockState] = useState(true);

	const baseUrl = useWatch({ control, name: "BaseURL" });
	const token = useWatch({ control, name: "Token" });
	const email = useWatch({ control, name: "Email" });
	const isEditMode = mode === "edit";

	return (
		<>
			<div className="relative">
				<Input
					{...register("BaseURL")}
					aria-label={t("jira.placeholders.baseUrl")}
					disabled={isLoading}
					isError={!!errors.BaseURL}
					isRequired
					label={t("jira.placeholders.baseUrl")}
					placeholder={t("jira.placeholders.exampleUrl")}
					value={baseUrl}
				/>
				<ErrorMessage>{errors.BaseURL?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				{isEditMode ? (
					<SecretInput
						type="password"
						{...register("Token")}
						aria-label={t("jira.placeholders.pat")}
						disabled={isLoading}
						handleInputChange={(newValue) => setValue("Token", newValue)}
						handleLockAction={(newLockState) => setLockState(newLockState)}
						isError={!!errors.Token}
						isLocked={lockState}
						isRequired
						label={t("jira.placeholders.pat")}
						value={token}
					/>
				) : (
					<Input
						{...register("Token")}
						aria-label={t("jira.placeholders.pat")}
						disabled={isLoading}
						isError={!!errors.Token}
						isRequired
						isSensitive
						label={t("jira.placeholders.pat")}
					/>
				)}
				<ErrorMessage>{errors.Token?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				<Input
					{...register("Email")}
					aria-label={t("jira.placeholders.email")}
					disabled={isLoading}
					isError={!!errors.Email}
					label={t("jira.placeholders.email")}
					placeholder={t("jira.placeholders.emailSample")}
					type="email"
					value={email}
				/>
				<ErrorMessage>{errors.Email?.message as string}</ErrorMessage>
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
