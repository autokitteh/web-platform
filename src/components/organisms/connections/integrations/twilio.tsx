import React, { useMemo, useState } from "react";
import { FloppyDiskIcon, ExternalLinkIcon } from "@assets/image/icons";
import { Select, Button, ErrorMessage, Input, Link, Spinner } from "@components/atoms";
import { namespaces } from "@constants";
import { selectIntegrationTwilio, infoTwilioLinks } from "@constants/lists";
import { TwilioConnectionType } from "@enums";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoggerService } from "@services";
import { HttpService } from "@services";
import { useToastStore } from "@store";
import { isConnectionType } from "@utilities";
import { twilioTokenIntegrationSchema, twilioApiKeyIntegrationSchema } from "@validations";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

export const TwilioIntegrationForm = () => {
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("integrations");
	const addToast = useToastStore((state) => state.addToast);

	const [selectedConnectionType, setSelectedConnectionType] = useState<TwilioConnectionType>();
	const [isLoading, setIsLoading] = useState(false);

	const formSchema = useMemo(() => {
		if (selectedConnectionType === TwilioConnectionType.AuthToken) return twilioTokenIntegrationSchema;
		if (selectedConnectionType === TwilioConnectionType.ApiKey) return twilioApiKeyIntegrationSchema;
	}, [selectedConnectionType]);

	const {
		handleSubmit,
		formState: { errors },
		register,
		getValues,
	} = useForm({
		resolver: formSchema ? zodResolver(formSchema) : undefined,
		defaultValues: {
			sid: "",
			token: "",
			key: "",
			secret: "",
		},
	});

	const onSubmit = async () => {
		const { sid, token, key, secret } = getValues();

		setIsLoading(true);
		try {
			const { data } = await HttpService.post("/twilio/save", {
				account_sid: sid,
				auth_token: token,
				api_key: key,
				api_secret: secret,
			});
			if (!data.url) {
				addToast({
					id: Date.now().toString(),
					message: tErrors("errorCreatingNewConnection"),
					title: "Error",
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
				title: "Error",
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
				className="px-3 ml-auto font-medium text-white border-white hover:bg-black w-fit"
				disabled={isLoading}
				type="submit"
				variant="outline"
			>
				{isLoading ? <Spinner /> : <FloppyDiskIcon className="w-5 h-5 transition fill-white" />}
				{t("buttons.saveConnection")}
			</Button>
			<div>
				<p className="text-lg">{t("information")}:</p>
				<div className="flex flex-col items-start gap-2 mt-2">
					{infoTwilioLinks.map(({ url, text }, idx) => (
						<Link
							className="inline-flex items-center ml-2 gap-2.5 group hover:text-green-accent"
							key={idx}
							target="_blank"
							to={url}
						>
							{text}
							<ExternalLinkIcon className="w-3.5 h-3.5 duration-200 fill-white group-hover:fill-green-accent" />
						</Link>
					))}
				</div>
			</div>
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
				className="px-3 ml-auto font-medium text-white border-white hover:bg-black w-fit"
				disabled={isLoading}
				type="submit"
				variant="outline"
			>
				{isLoading ? <Spinner /> : <FloppyDiskIcon className="w-5 h-5 transition fill-white" />}
				{t("buttons.saveConnection")}
			</Button>
			<div>
				<p className="text-lg">{t("information")}:</p>
				<div className="flex flex-col items-start gap-2 mt-2">
					{infoTwilioLinks.map(({ url, text }, idx) => (
						<Link
							className="inline-flex items-center ml-2 gap-2.5 group hover:text-green-accent"
							key={idx}
							target="_blank"
							to={url}
						>
							{text}
							<ExternalLinkIcon className="w-3.5 h-3.5 duration-200 fill-white group-hover:fill-green-accent" />
						</Link>
					))}
				</div>
			</div>
		</>
	);

	return (
		<form className="flex items-start gap-10" onSubmit={handleSubmit(onSubmit)}>
			<div className="flex flex-col w-full gap-6">
				<Select
					aria-label={t("placeholders.selectConnectionType")}
					onChange={(selected) => {
						if (selected?.value && isConnectionType(selected.value, TwilioConnectionType)) {
							setSelectedConnectionType(selected.value);
						}
					}}
					options={selectIntegrationTwilio}
					placeholder={t("placeholders.selectConnectionType")}
				/>
				{selectedConnectionType && selectedConnectionType === TwilioConnectionType.AuthToken ? renderAuthToken() : null}
				{selectedConnectionType && selectedConnectionType === TwilioConnectionType.ApiKey ? renderApiKey() : null}
			</div>
		</form>
	);
};
