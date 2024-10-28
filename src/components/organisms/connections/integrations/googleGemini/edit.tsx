import React, { useState } from "react";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { useConnectionForm } from "@src/hooks";
import { googleGeminiIntegrationSchema } from "@validations";

import { Button, ErrorMessage, SecretInput, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const GoogleGeminiIntegrationEditForm = () => {
	const { t } = useTranslation("integrations");
	const [lockState, setLockState] = useState(true);

	const { errors, handleSubmit, isLoading, onSubmitEdit, register, setValue } = useConnectionForm(
		googleGeminiIntegrationSchema,
		"edit"
	);

	return (
		<form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmitEdit)}>
			<div className="relative">
				<SecretInput
					type="password"
					{...register("key")}
					aria-label={t("gemini.placeholders.key")}
					handleInputChange={(newValue) => setValue("key", newValue)}
					handleLockAction={setLockState}
					isError={!!errors.key}
					isLocked={lockState}
					isRequired
					label={t("gemini.placeholders.key")}
				/>

				<ErrorMessage>{errors.key?.message as string}</ErrorMessage>
			</div>

			<Accordion title={t("information")}>
				<div className="flex flex-col gap-2">
					<Link
						className="group inline-flex items-center gap-2.5 text-green-800"
						target="_blank"
						to="https://aistudio.google.com/app"
					>
						{t("gemini.information.aiStudio")}

						<ExternalLinkIcon className="size-3.5 fill-green-800 duration-200" />
					</Link>

					<Link
						className="group inline-flex items-center gap-2.5 text-green-800"
						target="_blank"
						to="https://aistudio.google.com/app/apikey"
					>
						{t("gemini.information.apiKeys")}

						<ExternalLinkIcon className="size-3.5 fill-green-800 duration-200" />
					</Link>
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
		</form>
	);
};
