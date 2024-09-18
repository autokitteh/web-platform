import React, { useState } from "react";

import { useTranslation } from "react-i18next";

import { infoOpenAiLinks } from "@constants/lists/connections";
import { useConnectionForm } from "@src/hooks";
import { openAiIntegrationSchema } from "@validations";

import { Button, ErrorMessage, Link, SecretInput, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const OpenAiIntegrationEditForm = () => {
	const { t } = useTranslation("integrations");
	const [lockState, setLockState] = useState(true);

	const { errors, handleSubmit, isLoading, onSubmitEdit, register, setValue } = useConnectionForm(
		openAiIntegrationSchema,
		"edit"
	);

	return (
		<form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmitEdit)}>
			<div className="relative">
				<SecretInput
					{...register("key")}
					aria-label={t("openAi.placeholders.apiKey")}
					handleInputChange={(newValue) => setValue("key", newValue)}
					handleLockAction={setLockState}
					isError={!!errors.key}
					isLocked={lockState}
					isRequired
					label={t("openAi.placeholders.apiKey")}
				/>

				<ErrorMessage>{errors.key?.message as string}</ErrorMessage>
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
				<div className="flex flex-col gap-2">
					{infoOpenAiLinks.map(({ text, url }, index) => (
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
		</form>
	);
};
