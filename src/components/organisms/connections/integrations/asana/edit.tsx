import React, { useEffect, useState } from "react";

import { useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { infoAsanaLinks } from "@constants/lists/connections";
import { integrationVariablesMapping } from "@src/constants";
import { useConnectionForm } from "@src/hooks";
import { setFormValues } from "@src/utilities";
import { asanaIntegrationSchema } from "@validations";

import { Button, ErrorMessage, SecretInput, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const AsanaIntegrationEditForm = () => {
	const { t } = useTranslation("integrations");
	const [lockState, setLockState] = useState(true);
	const { connectionVariables, control, errors, handleSubmit, isLoading, onSubmitEdit, register, setValue } =
		useConnectionForm(asanaIntegrationSchema, "edit");

	const pat = useWatch({ control, name: "pat" });

	useEffect(() => {
		setFormValues(connectionVariables, integrationVariablesMapping.asana, setValue);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionVariables]);

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
				<div className="flex flex-col gap-2">
					{infoAsanaLinks.map(({ text, url }, index: number) => (
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
		</form>
	);
};
