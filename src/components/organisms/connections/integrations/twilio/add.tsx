import React, { useEffect, useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { SingleValue } from "react-select";

import { namespaces } from "@constants";
import { infoTwilioLinks, selectIntegrationTwilio } from "@constants/lists/connections";
import { TwilioConnectionType } from "@enums";
import { SelectOption } from "@interfaces/components";
import { HttpService, LoggerService } from "@services";
import { twilioApiKeyIntegrationSchema, twilioTokenIntegrationSchema } from "@validations";

import { useToastStore } from "@store";

import { Button, ErrorMessage, Input, Link, Select, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const TwilioIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
}: {
	connectionId?: string;
	triggerParentFormSubmit: () => void;
}) => {
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("integrations");
	const { projectId } = useParams();
	const navigate = useNavigate();
	const addToast = useToastStore((state) => state.addToast);
	const [selectedConnectionType, setSelectedConnectionType] = useState<SelectOption>();
	const [isLoading, setIsLoading] = useState(false);

	const formSchema = useMemo(() => {
		if (selectedConnectionType?.value === TwilioConnectionType.AuthToken) return twilioTokenIntegrationSchema;
		if (selectedConnectionType?.value === TwilioConnectionType.ApiKey) return twilioApiKeyIntegrationSchema;
	}, [selectedConnectionType]);

	const {
		formState: { errors },
		getValues,
		handleSubmit,
		register,
	} = useForm({
		resolver: formSchema ? zodResolver(formSchema) : undefined,
		defaultValues: {
			sid: "",
			token: "",
			key: "",
			secret: "",
		},
	});

	const createConnection = async () => {
		setIsLoading(true);
		const { key, secret, sid, token } = getValues();

		try {
			await HttpService.post(`/twilio/save?cid=${connectionId}&origin=web`, {
				account_sid: sid,
				auth_token: token,
				api_key: key,
				api_secret: secret,
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

	useEffect(() => {
		createConnection();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	const renderAuthToken = () => (
		<>
			<div className="relative">
				<Input
					{...register("sid")}
					aria-label={t("twilio.placeholders.sid")}
					isError={!!errors.sid}
					isRequired
					placeholder={t("twilio.placeholders.sid")}
				/>

				<ErrorMessage>{errors.sid?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				<Input
					{...register("token")}
					aria-label={t("twilio.placeholders.token")}
					isError={!!errors.token}
					isRequired
					placeholder={t("twilio.placeholders.token")}
				/>

				<ErrorMessage>{errors.token?.message as string}</ErrorMessage>
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
					{infoTwilioLinks.map(({ text, url }, index) => (
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

	const renderApiKey = () => (
		<>
			<div className="relative">
				<Input
					{...register("sid")}
					aria-label={t("twilio.placeholders.sid")}
					isError={!!errors.sid}
					isRequired
					placeholder={t("twilio.placeholders.sid")}
				/>

				<ErrorMessage>{errors.sid?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				<Input
					{...register("key")}
					aria-label={t("twilio.placeholders.key")}
					isError={!!errors.key}
					isRequired
					placeholder={t("twilio.placeholders.key")}
				/>

				<ErrorMessage>{errors.key?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				<Input
					{...register("secret")}
					aria-label={t("twilio.placeholders.secret")}
					isError={!!errors.secret}
					isRequired
					placeholder={t("twilio.placeholders.secret")}
				/>

				<ErrorMessage>{errors.secret?.message as string}</ErrorMessage>
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
					{infoTwilioLinks.map(({ text, url }, index) => (
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

	const selectConnectionType = (option: SingleValue<SelectOption>) => {
		setSelectedConnectionType(option as SelectOption);
	};

	const renderConnectionFields = () => {
		switch (selectedConnectionType?.value) {
			case TwilioConnectionType.AuthToken:
				return renderAuthToken();
			case TwilioConnectionType.ApiKey:
				return renderApiKey();
			default:
				return null;
		}
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
					onChange={selectConnectionType}
					options={selectIntegrationTwilio}
					placeholder={t("placeholders.selectConnectionType")}
					value={selectedConnectionType}
				/>

				{renderConnectionFields()}
			</div>
		</form>
	);
};
