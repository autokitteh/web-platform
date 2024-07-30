import React, { useEffect, useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { SingleValue } from "react-select";

import { namespaces } from "@constants";
import { infoHttpBasicLinks, infoHttpBearerLinks, selectIntegrationHttp } from "@constants/lists/connections";
import { HttpConnectionType } from "@enums";
import { SelectOption } from "@interfaces/components";
import { HttpService, LoggerService } from "@services";
import { httpBasicIntegrationSchema, httpBearerIntegrationSchema } from "@validations";

import { useToastStore } from "@store";

import { Button, ErrorMessage, Input, Link, Select, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const HttpIntegrationAddForm = ({
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
		if (selectedConnectionType?.value === HttpConnectionType.Basic) return httpBasicIntegrationSchema;
		if (selectedConnectionType?.value === HttpConnectionType.Bearer) return httpBearerIntegrationSchema;
	}, [selectedConnectionType]);

	const {
		formState: { errors },
		getValues,
		handleSubmit,
		register,
	} = useForm({
		resolver: formSchema ? zodResolver(formSchema) : undefined,
		defaultValues: {
			username: "",
			password: "",
			token: "",
		},
	});

	const createConnection = async () => {
		setIsLoading(true);
		const { password, token, username } = getValues();

		try {
			await HttpService.post(`/http/save?cid=${connectionId}&origin=web`, {
				basic_username: username,
				basic_password: password,
				bearer_access_token: token,
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

	const renderNoAuth = () => (
		<Button
			aria-label={t("buttons.saveConnection")}
			className="ml-auto w-fit bg-white px-3 font-medium hover:bg-gray-500 hover:text-white"
			disabled={isLoading}
			onClick={triggerParentFormSubmit}
		>
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
					{infoHttpBasicLinks.map(({ text, url }, index) => (
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
					{infoHttpBearerLinks.map(({ text, url }, index) => (
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

	useEffect(() => {
		if (!connectionId) return;

		switch (selectedConnectionType?.value) {
			case HttpConnectionType.NoAuth:
				navigate(`/projects/${projectId}/connections`);
				break;

			default:
				createConnection();
				break;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	const selectConnectionType = (option: SingleValue<SelectOption>) => {
		setSelectedConnectionType(option as SelectOption);
	};

	const renderConnectionFields = () => {
		switch (selectedConnectionType?.value) {
			case HttpConnectionType.NoAuth:
				return renderNoAuth();
			case HttpConnectionType.Basic:
				return renderBasic();
			case HttpConnectionType.Bearer:
				return renderBearer();
			default:
				return null;
		}
	};

	return (
		<form className="flex items-start gap-10" onSubmit={handleSubmit(onSubmit)}>
			<div className="flex w-full flex-col gap-6">
				<Select
					aria-label={t("placeholders.selectConnectionType")}
					onChange={selectConnectionType}
					options={selectIntegrationHttp}
					placeholder={t("placeholders.selectConnectionType")}
					value={selectedConnectionType}
				/>

				{renderConnectionFields()}
			</div>
		</form>
	);
};
