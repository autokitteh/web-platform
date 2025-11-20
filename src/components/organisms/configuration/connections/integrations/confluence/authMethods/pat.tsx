import React, { useState } from "react";

import { FieldErrors, UseFormRegister, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { infoConfluenceLinks } from "@constants/lists/connections";

import { Button, ErrorMessage, Input, Link, SecretInput, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const ConfluencePatForm = ({
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

	const baseUrl = useWatch({ control, name: "base_url" });
	const pat = useWatch({ control, name: "pat" });
	const isEditMode = mode === "edit";

	return (
		<>
			<div className="relative">
				<Input
					{...register("base_url")}
					aria-label={t("confluence.placeholders.baseUrl")}
					disabled={isLoading}
					isError={!!errors.base_url}
					isRequired
					label={t("confluence.placeholders.baseUrl")}
					placeholder={t("confluence.placeholders.exampleUrl")}
					value={baseUrl}
				/>
				<ErrorMessage>{errors.base_url?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				{isEditMode ? (
					<SecretInput
						type="password"
						{...register("pat")}
						aria-label={t("confluence.placeholders.pat")}
						disabled={isLoading}
						handleInputChange={(newValue) => setValue("pat", newValue)}
						handleLockAction={(newLockState) => setLockState(newLockState)}
						isError={!!errors.pat}
						isLocked={lockState}
						isRequired
						label={t("confluence.placeholders.pat")}
						value={pat}
					/>
				) : (
					<Input
						{...register("pat")}
						aria-label={t("confluence.placeholders.pat")}
						disabled={isLoading}
						isError={!!errors.pat}
						isRequired
						isSensitive
						label={t("confluence.placeholders.pat")}
					/>
				)}
				<ErrorMessage>{errors.pat?.message as string}</ErrorMessage>
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
