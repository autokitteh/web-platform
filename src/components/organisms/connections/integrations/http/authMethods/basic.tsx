import React, { useState } from "react";

import { FieldErrors, UseFormRegister } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { infoHttpBasicLinks } from "@constants/lists/connections";

import { Button, ErrorMessage, Input, Link, SecretInput, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const HttpBasicForm = ({
	errors,
	isLoading,
	mode,
	register,
	setValue,
}: {
	copyToClipboard: (webhookUrlPath: string) => void;
	errors: FieldErrors<any>;
	isLoading: boolean;
	mode: "create" | "edit";
	patWebhookKey?: string;
	register: UseFormRegister<{ [x: string]: any }>;
	setValue: any;
}) => {
	const { t } = useTranslation("integrations");
	const [lockState, setLockState] = useState<{ basic_password: boolean; basic_username: boolean }>({
		basic_username: true,
		basic_password: true,
	});
	const isEditMode = mode === "edit";

	return (
		<>
			<div className="relative">
				{isEditMode ? (
					<SecretInput
						{...register("basic_username")}
						aria-label={t("http.placeholders.username")}
						handleInputChange={(newValue) => setValue("basic_username", newValue)}
						handleLockAction={(newLockState: boolean) =>
							setLockState((prevState) => ({ ...prevState, basic_username: newLockState }))
						}
						isError={!!errors.basic_username}
						isLocked={lockState.basic_username}
						isRequired
						label={t("http.placeholders.username")}
					/>
				) : (
					<Input
						{...register("basic_username")}
						aria-label={t("http.placeholders.username")}
						isError={!!errors.username}
						isRequired
						label={t("http.placeholders.username")}
					/>
				)}

				<ErrorMessage>{errors.basic_username?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				{isEditMode ? (
					<SecretInput
						{...register("basic_password")}
						aria-label={t("http.placeholders.password")}
						handleInputChange={(newValue) => setValue("basic_password", newValue)}
						handleLockAction={(newLockState: boolean) =>
							setLockState((prevState) => ({ ...prevState, basic_password: newLockState }))
						}
						isError={!!errors.basic_password}
						isLocked={lockState.basic_password}
						isRequired
						label={t("http.placeholders.password")}
					/>
				) : (
					<Input
						{...register("basic_password")}
						aria-label={t("http.placeholders.password")}
						isError={!!errors.basic_password}
						isRequired
						label={t("http.placeholders.password")}
					/>
				)}

				<ErrorMessage>{errors.basic_password?.message as string}</ErrorMessage>
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
					{infoHttpBasicLinks.map(({ text, url }, index) => (
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
