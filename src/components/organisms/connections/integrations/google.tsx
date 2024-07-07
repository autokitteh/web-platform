import React, { useState } from "react";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";
import { Button, ErrorMessage, Link, Select, Spinner, Textarea } from "@components/atoms";
import { baseUrl, namespaces } from "@constants";
import { infoGoogleAccountLinks, infoGoogleUserLinks, selectIntegrationGoogle } from "@constants/lists";
import { GoogleConnectionType } from "@enums";
import { zodResolver } from "@hookform/resolvers/zod";
import { HttpService, LoggerService } from "@services";
import { useToastStore } from "@store";
import { isConnectionType } from "@utilities";
import { googleIntegrationSchema } from "@validations";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

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
			<p className="text-lg">{t("information")}:</p>
			<div className="flex flex-col gap-2 items-start mt-2">
				{infoGoogleUserLinks.map(({ text, url }, index) => (
					<Link
						className="gap-2.5 group hover:text-green-accent inline-flex items-center ml-2"
						key={index}
						target="_blank"
						to={url}
					>
						{text}

						<ExternalLinkIcon className="duration-200 fill-white group-hover:fill-green-accent h-3.5 w-3.5" />
					</Link>
				))}
			</div>
			<Button
				aria-label={t("buttons.startOAuthFlow")}
				className="bg-white border-black font-medium hover:bg-gray-500 hover:text-white ml-auto px-3 w-fit"
				onClick={handleGoogleOAuth}
				variant="outline"
			>
				{t("buttons.startOAuthFlow")}
			</Button>
		</>
	);

	const renderServiceAccount = () => (
		<div>
			<div className="mb-3 relative">
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
				className="border-white font-medium hover:bg-black ml-auto px-3 text-white w-fit"
				disabled={isLoading}
				type="submit"
				variant="outline"
			>
				{isLoading ? <Spinner /> : <FloppyDiskIcon className="fill-white h-5 transition w-5" />}

				{t("buttons.saveConnection")}
			</Button>

			<p className="text-lg">{t("information")}:</p>

			<div className="flex flex-col gap-2 items-start mt-2">
				{infoGoogleAccountLinks.map(({ text, url }, index) => (
					<Link
						className="gap-2.5 group hover:text-green-accent inline-flex items-center ml-2"
						key={index}
						target="_blank"
						to={url}
					>
						{text}

						<ExternalLinkIcon className="duration-200 fill-white group-hover:fill-green-accent h-3.5 w-3.5" />
					</Link>
				))}
			</div>
		</div>
	);

	return (
		<form className="flex gap-10 items-start" onSubmit={handleSubmit(onSubmit)}>
			<div className="flex flex-col gap-6 w-full">
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
