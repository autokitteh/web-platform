import React, { useState } from "react";

import { FieldErrors, UseFormRegister } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { infoTwilioLinks } from "@constants/lists/connections";

import { Button, ErrorMessage, Input, Link, SecretInput, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const ApiTokenJiraForm = ({
	errors,
	isLoading,
	mode,
	register,
	setValue,
}: {
	errors: FieldErrors<any>;
	isLoading: boolean;
	mode: "create" | "edit";
	register: UseFormRegister<{ [x: string]: any }>;
	setValue: any;
}) => {
	const { t } = useTranslation("integrations");
	const [lockState, setLockState] = useState<{ base_url: boolean; email: boolean; token: boolean }>({
		base_url: true,
		token: true,
		email: true,
	});
	const isEditMode = mode === "edit";

	return (
		<>
			<div className="relative">
				{isEditMode ? (
					<SecretInput
						{...register("base_url")}
						aria-label={t("jira.placeholders.baseUrl")}
						handleInputChange={(newValue) => setValue("base_url", newValue)}
						handleLockAction={(newLockState: boolean) =>
							setLockState((prevState) => ({ ...prevState, base_url: newLockState }))
						}
						isError={!!errors.base_url}
						isLocked={lockState.base_url}
						isRequired
						placeholder={t("jira.placeholders.baseUrl")}
						resetOnFirstFocus
					/>
				) : (
					<Input
						{...register("base_url")}
						aria-label={t("jira.placeholders.baseUrl")}
						isError={!!errors.base_url}
						isRequired
						placeholder={t("jira.placeholders.baseUrl")}
					/>
				)}

				<ErrorMessage>{errors.base_url?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				{isEditMode ? (
					<SecretInput
						{...register("token")}
						aria-label={t("jira.placeholders.token")}
						handleInputChange={(newValue) => setValue("token", newValue)}
						handleLockAction={(newLockState: boolean) =>
							setLockState((prevState) => ({ ...prevState, token: newLockState }))
						}
						isError={!!errors.token}
						isLocked={lockState.token}
						isRequired
						placeholder={t("jira.placeholders.token")}
						resetOnFirstFocus
					/>
				) : (
					<Input
						{...register("token")}
						aria-label={t("jira.placeholders.token")}
						isError={!!errors.token}
						isRequired
						placeholder={t("jira.placeholders.token")}
					/>
				)}

				<ErrorMessage>{errors.token?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				{isEditMode ? (
					<SecretInput
						{...register("email")}
						aria-label={t("jira.placeholders.email")}
						handleInputChange={(newValue) => setValue("email", newValue)}
						handleLockAction={(newLockState: boolean) =>
							setLockState((prevState) => ({ ...prevState, email: newLockState }))
						}
						isError={!!errors.email}
						isLocked={lockState.email}
						isRequired
						placeholder={t("jira.placeholders.email")}
						resetOnFirstFocus
					/>
				) : (
					<Input
						{...register("email")}
						aria-label={t("jira.placeholders.email")}
						isError={!!errors.email}
						placeholder={t("jira.placeholders.email")}
						type="email"
					/>
				)}

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
