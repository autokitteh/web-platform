import React, { useState } from "react";

import { FieldErrors, UseFormRegister } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { infoHttpBearerLinks } from "@constants/lists/connections";

import { Button, ErrorMessage, Input, Link, SecretInput, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const HttpBearerForm = ({
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
	const [lockState, setLockState] = useState<{ bearer_access_token: boolean }>({
		bearer_access_token: true,
	});
	const isEditMode = mode === "edit";

	return (
		<>
			<div className="relative">
				{isEditMode ? (
					<SecretInput
						{...register("bearer_access_token")}
						aria-label={t("http.placeholders.accessToken")}
						handleInputChange={(newValue) => setValue("token", newValue)}
						handleLockAction={(newLockState: boolean) =>
							setLockState((prevState) => ({ ...prevState, bearer_access_token: newLockState }))
						}
						isError={!!errors.bearer_access_token}
						isLocked={lockState.bearer_access_token}
						isRequired
						placeholder={t("http.placeholders.accessToken")}
						resetOnFirstFocus
					/>
				) : (
					<Input
						{...register("bearer_access_token")}
						aria-label={t("http.placeholders.accessToken")}
						isError={!!errors.bearer_access_token}
						isRequired
						placeholder={t("http.placeholders.accessToken")}
					/>
				)}

				<ErrorMessage>{errors.bearer_access_token?.message as string}</ErrorMessage>
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
					{infoHttpBearerLinks.map(({ text, url }, index) => (
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
