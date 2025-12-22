import React, { useState } from "react";

import { useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { useConnectionForm } from "@src/hooks";
import { asanaIntegrationSchema } from "@validations";

import { Button, ErrorMessage, SecretInput, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const AsanaIntegrationEditForm = () => {
	const { t } = useTranslation("integrations");
	const [lockState, setLockState] = useState(true);
	const { control, errors, handleSubmit, isLoading, onSubmitEdit, register, setValue } = useConnectionForm(
		asanaIntegrationSchema,
		"edit"
	);

	const pat = useWatch({ control, name: "pat" });

	return (
		<form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmitEdit)}>
			<div className="relative">
				<SecretInput
					type="password"
					{...register("pat")}
					aria-label={t("asana.placeholders.pat")}
					disabled={isLoading}
					handleInputChange={(newValue) => setValue("pat", newValue)}
					handleLockAction={setLockState}
					isError={!!errors.pat}
					isLocked={lockState}
					isRequired
					label={t("asana.placeholders.pat")}
					value={pat}
				/>

				<ErrorMessage>{errors.pat?.message as string}</ErrorMessage>
			</div>

			<Accordion title={t("information")}>
				<Link
					className="group inline-flex items-center gap-2.5 text-green-800"
					target="_blank"
					to="https://developers.asana.com/"
				>
					{t("asana.information.devPlatform")}

					<ExternalLinkIcon className="size-3.5 fill-green-800 duration-200" />
				</Link>
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
