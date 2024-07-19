import React, { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { baseUrl, namespaces } from "@constants";
import { infoGoogleAccountLinks, infoGoogleUserLinks, selectIntegrationGoogle } from "@constants/lists";
import { GoogleConnectionType } from "@enums";
import { HttpService, LoggerService } from "@services";
import { isConnectionType } from "@utilities";
import { googleIntegrationSchema } from "@validations";

import { useToastStore } from "@store";

import { Button, ErrorMessage, Link, Select, Spinner, Textarea } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const GoogleIntegrationForm = () => {
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("integrations");
	const [selectedConnectionType, setSelectedConnectionType] = useState<GoogleConnectionType>();

	const [isLoading, setIsLoading] = useState(false);
	const addToast = useToastStore((state) => state.addToast);

	const {
		formState: { errors },
		getValues,
		handleSubmit,
		register,
	} = useForm({
		defaultValues: {
			jsonKey: "",
		},
		resolver: zodResolver(googleIntegrationSchema),
	});

	const onSubmit = async () => {
		const { jsonKey } = getValues();

		setIsLoading(true);
		try {
			const { data } = await HttpService.post("/google/save", { jsonKey });
			if (!data.url) {
				addToast({
					id: Date.now().toString(),
					message: tErrors("errorCreatingNewConnection"),
					type: "error",
				});
				LoggerService.error(
					namespaces.connectionService,
					`${tErrors("errorCreatingNewConnectionExtended", { error: tErrors("noDataReturnedFromServer") })}`
				);

				return;
			}
		} catch (error) {
			addToast({
				id: Date.now().toString(),
				message: tErrors("errorCreatingNewConnection"),
				type: "error",
			});
			LoggerService.error(
				namespaces.connectionService,
				`${tErrors("errorCreatingNewConnectionExtended", { error: (error as Error).message })}`
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleOAuth = () => window.open(`${baseUrl}/oauth/start/google`, "_blank");

	const renderOAuthButton = () => (
		<>
			<Accordion title={t("information")}>
				<div className="flex flex-col items-start gap-2">
					{infoGoogleUserLinks.map(({ text, url }, index) => (
						<Link
							className="inline-flex items-center gap-2.5 text-green-accent"
							key={index}
							target="_blank"
							to={url}
						>
							{text}

							<ExternalLinkIcon className="h-3.5 w-3.5 fill-green-accent duration-200" />
						</Link>
					))}
				</div>
			</Accordion>
			<Button
				aria-label={t("buttons.startOAuthFlow")}
				className="ml-auto w-fit border-black bg-white px-3 font-medium hover:bg-gray-500 hover:text-white"
				onClick={handleGoogleOAuth}
				variant="outline"
			>
				{t("buttons.startOAuthFlow")}
			</Button>
		</>
	);

	const renderServiceAccount = () => (
		<div>
			<div className="relative mb-3">
				<Textarea
					rows={5}
					{...register("jsonKey")}
					aria-label={t("google.placeholders.jsonKey")}
					isError={!!errors.jsonKey}
					placeholder={t("google.placeholders.jsonKey")}
				/>

				<ErrorMessage>{errors.jsonKey?.message as string}</ErrorMessage>
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
				<div className="flex flex-col items-start gap-2">
					{infoGoogleAccountLinks.map(({ text, url }, index) => (
						<Link
							className="inline-flex items-center gap-2.5 text-green-accent"
							key={index}
							target="_blank"
							to={url}
						>
							{text}

							<ExternalLinkIcon className="h-3.5 w-3.5 fill-green-accent duration-200" />
						</Link>
					))}
				</div>
			</Accordion>
		</div>
	);

	return (
		<form className="flex items-start gap-10" onSubmit={handleSubmit(onSubmit)}>
			<div className="flex w-full flex-col gap-6">
				<Select
					aria-label={t("placeholders.selectConnectionType")}
					noOptionsLabel={t("placeholders.noConnectionTypesAvailable")}
					onChange={(selected) => {
						if (selected?.value && isConnectionType(selected.value, GoogleConnectionType)) {
							setSelectedConnectionType(selected.value);
						}
					}}
					options={selectIntegrationGoogle}
					placeholder={t("placeholders.selectConnectionType")}
				/>

				{selectedConnectionType && selectedConnectionType === GoogleConnectionType.Oauth
					? renderOAuthButton()
					: null}

				{selectedConnectionType && selectedConnectionType === GoogleConnectionType.ServiceAccount
					? renderServiceAccount()
					: null}
			</div>
		</form>
	);
};
