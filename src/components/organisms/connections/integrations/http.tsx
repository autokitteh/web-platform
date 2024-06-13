import React, { useMemo, useState } from "react";
import { FloppyDiskIcon, ExternalLinkIcon } from "@assets/image/icons";
import { Select, Button, ErrorMessage, Input, Link, Spinner } from "@components/atoms";
import { namespaces } from "@constants";
import { infoHttpBasicLinks, infoHttpBearerLinks, selectIntegrationHttp } from "@constants/lists";
import { HttpConnectionType } from "@enums";
import { zodResolver } from "@hookform/resolvers/zod";
import { HttpService, LoggerService } from "@services";
import { useToastStore } from "@store";
import { isConnectionType } from "@utilities";
import { httpBasicIntegrationSchema, httpBearerIntegrationSchema } from "@validations";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

export const HttpIntegrationForm = () => {
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("integrations");
	const addToast = useToastStore((state) => state.addToast);

	const [selectedConnectionType, setSelectedConnectionType] = useState<HttpConnectionType>();
	const [isLoading, setIsLoading] = useState(false);

	const formSchema = useMemo(() => {
		if (selectedConnectionType === HttpConnectionType.Basic) return httpBasicIntegrationSchema;
		if (selectedConnectionType === HttpConnectionType.Bearer) return httpBearerIntegrationSchema;
	}, [selectedConnectionType]);

	const {
		handleSubmit,
		formState: { errors },
		register,
		getValues,
	} = useForm({
		resolver: formSchema ? zodResolver(formSchema) : undefined,
		defaultValues: {
			username: "",
			password: "",
			token: "",
		},
	});

	const onSubmit = async () => {
		const { username, password, token } = getValues();

		setIsLoading(true);
		try {
			const { data } = await HttpService.post("/i/http/save", {
				basic_username: username,
				basic_password: password,
				bearer_access_token: token,
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

	const renderNoAuth = () => (
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
	);
	const renderBasic = () => (
		<>
			<div className="relative">
				<Input
					{...register("username")}
					aria-label={t("http.placeholders.username")}
					isError={!!errors.username}
					isRequired
					placeholder={t("http.placeholders.username")}
				/>
				<ErrorMessage>{errors.username?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				<Input
					{...register("password")}
					aria-label={t("http.placeholders.password")}
					isError={!!errors.password}
					isRequired
					placeholder={t("http.placeholders.password")}
				/>
				<ErrorMessage>{errors.password?.message as string}</ErrorMessage>
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
					{infoHttpBasicLinks.map(({ url, text }, idx) => (
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
	const renderBearer = () => (
		<>
			<div className="relative">
				<Input
					{...register("token")}
					aria-label={t("http.placeholders.accessToken")}
					isError={!!errors.token}
					isRequired
					placeholder={t("http.placeholders.accessToken")}
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
					{infoHttpBearerLinks.map(({ url, text }, idx) => (
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
						if (selected?.value && isConnectionType(selected.value, HttpConnectionType)) {
							setSelectedConnectionType(selected.value);
						}
					}}
					options={selectIntegrationHttp}
					placeholder={t("placeholders.selectConnectionType")}
				/>
				{selectedConnectionType && selectedConnectionType === HttpConnectionType.NoAuth ? renderNoAuth() : null}
				{selectedConnectionType && selectedConnectionType === HttpConnectionType.Basic ? renderBasic() : null}
				{selectedConnectionType && selectedConnectionType === HttpConnectionType.Bearer ? renderBearer() : null}
			</div>
		</form>
	);
};
