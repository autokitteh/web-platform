import React, { useState } from "react";
import { ExternalLinkIcon, TestIcon } from "@assets/image/icons";
import { Select, Button, Link, Toast, Spinner, Textarea, ErrorMessage } from "@components/atoms";
import { baseUrl, namespaces } from "@constants";
import { selectIntegrationGoogle, infoGoogleUserLinks, infoGoogleAccountLinks } from "@constants/lists";
import { GoogleConnectionType } from "@enums";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoggerService, httpService } from "@services";
import { isConnectionType } from "@utilities";
import { googleIntegrationSchema } from "@validations";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

export const GoogleIntegrationForm = () => {
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("integrations");
	const [selectedConnectionType, setSelectedConnectionType] = useState<GoogleConnectionType>();
	const [toast, setToast] = useState({ isOpen: false, isSuccess: false, message: "" });

	const [isLoading, setIsLoading] = useState(false);

	const {
		handleSubmit,
		formState: { errors },
		register,
		getValues,
	} = useForm({
		resolver: zodResolver(googleIntegrationSchema),
		defaultValues: {
			jsonKey: "",
		},
	});

	const onSubmit = async () => {
		const { jsonKey } = getValues();

		setIsLoading(true);
		try {
			const { data } = await httpService.post("/google/save", { jsonKey });
			if (!data.url) return;
		} catch (error) {
			console.log("error", error);

			LoggerService.error(namespaces.connectionService, "Error while creating a new connection");
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleOAuth = () => window.open(`${baseUrl}/oauth/start/google`, "_blank");

	const renderOAuthButton = () => (
		<>
			<p className="text-lg">{t("information")}:</p>
			<div className="flex flex-col items-start gap-2 mt-2">
				{infoGoogleUserLinks.map(({ url, text, id }) => (
					<Link
						className="inline-flex items-center ml-2 gap-2.5 group hover:text-green-accent"
						key={id}
						target="_blank"
						to={url}
					>
						{text}
						<ExternalLinkIcon className="w-3.5 h-3.5 duration-200 fill-white group-hover:fill-green-accent" />
					</Link>
				))}
			</div>
			<Button
				aria-label={t("buttons.startOAuthFlow")}
				className="px-3 ml-auto font-medium bg-white border-black hover:bg-gray-500 hover:text-white w-fit"
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
				className="px-3 ml-auto font-medium text-white border-white hover:bg-black w-fit"
				disabled={isLoading}
				type="submit"
				variant="outline"
			>
				{isLoading ? <Spinner /> : <TestIcon className="w-5 h-4 transition fill-white" />} {t("buttons.saveConnection")}
			</Button>
			<p className="text-lg">{t("information")}:</p>
			<div className="flex flex-col items-start gap-2 mt-2">
				{infoGoogleAccountLinks.map(({ url, text, id }) => (
					<Link
						className="inline-flex items-center ml-2 gap-2.5 group hover:text-green-accent"
						key={id}
						target="_blank"
						to={url}
					>
						{text}
						<ExternalLinkIcon className="w-3.5 h-3.5 duration-200 fill-white group-hover:fill-green-accent" />
					</Link>
				))}
			</div>
		</div>
	);

	const toastProps = {
		duration: 5,
		isOpen: toast.isOpen,
		onClose: () => setToast({ ...toast, isOpen: false }),
		title: toast.isSuccess ? t("success") : tErrors("error"),
	};

	return (
		<>
			<form className="flex items-start gap-10" onSubmit={handleSubmit(onSubmit)}>
				<div className="flex flex-col w-full gap-6">
					<Select
						aria-label={t("placeholders.selectConnectionType")}
						onChange={(selected) => {
							if (selected?.value && isConnectionType(selected.value, GoogleConnectionType)) {
								setSelectedConnectionType(selected.value);
							}
						}}
						options={selectIntegrationGoogle}
						placeholder={t("placeholders.selectConnectionType")}
					/>
					{selectedConnectionType && selectedConnectionType === GoogleConnectionType.Oauth ? renderOAuthButton() : null}
					{selectedConnectionType && selectedConnectionType === GoogleConnectionType.JsonKey
						? renderServiceAccount()
						: null}
				</div>
			</form>
			<Toast {...toastProps} ariaLabel={toast.message} type={toast.isSuccess ? "success" : "error"}>
				<p className="mt-1 text-xs">{toast.message}</p>
			</Toast>
		</>
	);
};
