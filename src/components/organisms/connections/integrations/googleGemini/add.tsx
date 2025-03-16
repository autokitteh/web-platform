import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { googleGeminiIntegrationSchema } from "@validations";

import { Button, ErrorMessage, Input, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const GoogleGeminiIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
}: {
	connectionId?: string;
	triggerParentFormSubmit: () => void;
}) => {
	const { t } = useTranslation("integrations");

	const { handleConnectionConfig, errors, handleSubmit, isLoading, register } = useConnectionForm(
		googleGeminiIntegrationSchema,
		"create"
	);

	useEffect(() => {
		if (connectionId) {
			handleConnectionConfig(connectionId, ConnectionAuthType.ApiKey, Integrations.googlegemini);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	return (
		<form className="flex flex-col gap-6" onSubmit={handleSubmit(triggerParentFormSubmit)}>
			<div className="relative">
				<Input
					{...register("key")}
					aria-label={t("gemini.placeholders.key")}
					disabled={isLoading}
					isError={!!errors.key}
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
