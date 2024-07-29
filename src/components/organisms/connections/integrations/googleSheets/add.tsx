import React, { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { SingleValue } from "react-select";

import { baseUrl, namespaces } from "@constants";
import { infoGoogleAccountLinks, infoGoogleUserLinks, selectIntegrationGoogle } from "@constants/lists";
import { GoogleConnectionType } from "@enums";
import { SelectOption } from "@interfaces/components";
import { HttpService, LoggerService } from "@services";
import { googleIntegrationSchema } from "@validations";

import { useToastStore } from "@store";

import { Button, ErrorMessage, Link, Select, Spinner, Textarea } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const GoogleSheetsIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
}: {
	connectionId?: string;
	triggerParentFormSubmit: () => void;
}) => {
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("integrations");
	const [selectedConnectionType, setSelectedConnectionType] = useState<SelectOption>();
	const { projectId } = useParams();
	const navigate = useNavigate();
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

	const createConnection = async () => {
		setIsLoading(false);
		const { jsonKey } = getValues();

		try {
			await HttpService.post(`/google/save?cid=${connectionId}&origin=web`, {
				jsonKey,
			});
			const successMessage = t("connectionCreatedSuccessfully");
			addToast({
				id: Date.now().toString(),
				message: successMessage,
				type: "success",
			});
			LoggerService.info(namespaces.connectionService, successMessage);
			navigate(`/projects/${projectId}/connections`);
		} catch (error) {
			const errorMessage = error.response?.data || tErrors("errorCreatingNewConnection");
			addToast({
				id: Date.now().toString(),
				message: errorMessage,
				type: "error",
			});
			LoggerService.error(
				namespaces.connectionService,
				`${tErrors("errorCreatingNewConnectionExtended", { error: errorMessage })}`
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleOAuth = async () => {
		try {
			window.open(`${baseUrl}/oauth/start/google?cid=${connectionId}&origin=web`, "_blank");
			navigate(`/projects/${projectId}/connections`);
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

	const renderOAuthButton = () => (
		<>
			<Accordion title={t("information")}>
				<div className="flex flex-col items-start gap-2">
					{infoGoogleUserLinks.map(({ text, url }, index) => (
						<Link
							className="inline-flex items-center gap-2.5 text-green-800"
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
			<Button
				aria-label={t("buttons.startOAuthFlow")}
				className="ml-auto w-fit border-black bg-white px-3 font-medium hover:bg-gray-950 hover:text-white"
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
							className="inline-flex items-center gap-2.5 text-green-800"
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
		</div>
	);

	useEffect(() => {
		switch (selectedConnectionType?.value) {
			case GoogleConnectionType.ServiceAccount:
				createConnection();
				break;

			case GoogleConnectionType.Oauth:
				handleGoogleOAuth();
				break;

			default:
				break;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	const renderConnectionFields = () => {
		switch (selectedConnectionType?.value) {
			case GoogleConnectionType.ServiceAccount:
				return renderServiceAccount();
			case GoogleConnectionType.Oauth:
				return renderOAuthButton();
			default:
				return null;
		}
	};

	const selectConnectionType = (option: SingleValue<SelectOption>) => {
		setSelectedConnectionType(option as SelectOption);
	};

	const onSubmit = () => {
		if (connectionId) {
			addToast({
				id: Date.now().toString(),
				message: tErrors("connectionExists"),
				type: "error",
			});

			LoggerService.error(
				namespaces.connectionService,
				`${tErrors("connectionExistsExtended", { connectionId })}`
			);

			return;
		}

		triggerParentFormSubmit();
	};

	return (
		<form className="flex items-start gap-10" onSubmit={handleSubmit(onSubmit)}>
			<div className="flex w-full flex-col gap-6">
				<Select
					aria-label={t("placeholders.selectConnectionType")}
					noOptionsLabel={t("placeholders.noConnectionTypesAvailable")}
					onChange={selectConnectionType}
					options={selectIntegrationGoogle}
					placeholder={t("placeholders.selectConnectionType")}
					value={selectedConnectionType}
				/>

				{renderConnectionFields()}
			</div>
		</form>
	);
};
