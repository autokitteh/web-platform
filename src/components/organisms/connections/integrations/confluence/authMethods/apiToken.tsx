import React, { useState } from "react";

import { FieldErrors, UseFormRegister } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { infoConfluenceLinks } from "@constants/lists/connections";

import { Button, ErrorMessage, Input, Link, SecretInput, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const ConfluenceApiTokenForm = ({
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
						aria-label={t("confluence.placeholders.baseUrl")}
						handleInputChange={(newValue) => setValue("base_url", newValue)}
						handleLockAction={(newLockState: boolean) =>
							setLockState((prevState) => ({ ...prevState, base_url: newLockState }))
						}
						isError={!!errors.base_url}
						isLocked={lockState.base_url}
						isRequired
						label={t("confluence.placeholders.baseUrl")}
						placeholder={t("confluence.placeholders.exampleUrl")}
					/>
				) : (
					<Input
						{...register("base_url")}
						aria-label={t("confluence.placeholders.baseUrl")}
						isError={!!errors.base_url}
						isRequired
						label={t("confluence.placeholders.baseUrl")}
						placeholder={t("confluence.placeholders.exampleUrl")}
					/>
				)}

				<ErrorMessage>{errors.base_url?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				{isEditMode ? (
					<SecretInput
						{...register("token")}
						aria-label={t("confluence.placeholders.pat")}
						handleInputChange={(newValue) => setValue("token", newValue)}
						handleLockAction={(newLockState: boolean) =>
							setLockState((prevState) => ({ ...prevState, token: newLockState }))
						}
						isError={!!errors.token}
						isLocked={lockState.token}
						isRequired
						label={t("confluence.placeholders.pat")}
					/>
				) : (
					<Input
						{...register("token")}
						aria-label={t("confluence.placeholders.pat")}
						isError={!!errors.token}
						isRequired
						label={t("confluence.placeholders.pat")}
					/>
				)}

				<ErrorMessage>{errors.token?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				{isEditMode ? (
					<SecretInput
						{...register("email")}
						aria-label={t("confluence.placeholders.email")}
						handleInputChange={(newValue) => setValue("email", newValue)}
						handleLockAction={(newLockState: boolean) =>
							setLockState((prevState) => ({ ...prevState, email: newLockState }))
						}
						isError={!!errors.email}
						isLocked={lockState.email}
						label={t("confluence.placeholders.email")}
						placeholder={t("confluence.placeholders.emailSample")}
					/>
				) : (
					<Input
						{...register("email")}
						aria-label={t("confluence.placeholders.email")}
						isError={!!errors.email}
						label={t("confluence.placeholders.email")}
						placeholder={t("confluence.placeholders.emailSample")}
						type="email"
					/>
				)}

				<ErrorMessage>{errors.email?.message as string}</ErrorMessage>
			</div>

			<Accordion title={t("information")}>
				<div className="flex flex-col gap-2">
					{infoConfluenceLinks.map(({ text, url }, index) => (
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
