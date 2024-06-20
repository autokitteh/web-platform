import React, { useState } from "react";
import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";
import { Select, Button, Link, Spinner, Textarea, ErrorMessage } from "@components/atoms";
import { baseUrl, namespaces } from "@constants";
import { selectIntegrationGoogle, infoGoogleUserLinks, infoGoogleAccountLinks } from "@constants/lists";
import { GoogleConnectionType } from "@enums";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoggerService, HttpService, ConnectionService } from "@services";
import { useToastStore } from "@store";
import { isConnectionType } from "@utilities";
import { googleIntegrationSchema } from "@validations";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

export const GoogleIntegrationForm = ({
	connectionName,
	isConnectionNameValid,
	triggerParentFormSubmit,
}: {
	connectionName?: string;
	isConnectionNameValid: boolean;
	triggerParentFormSubmit: () => void;
}) => {
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("integrations");
	const [selectedConnectionType, setSelectedConnectionType] = useState<GoogleConnectionType>();
	const { projectId } = useParams();
	const navigate = useNavigate();

	const [isLoading, setIsLoading] = useState(false);
	const addToast = useToastStore((state) => state.addToast);

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
		if (!isConnectionNameValid) {
			triggerParentFormSubmit();
			return;
		}

		const { jsonKey } = getValues();

		setIsLoading(true);
		try {
			await ConnectionService.create(projectId!, "google", connectionName!);

			const data = await HttpService.post("/google/save", { jsonKey });

			if (data.request.responseURL.includes("error=")) {
				const errorMsg = new URL(data.request.responseURL).searchParams.get("error");
				throw new Error(errorMsg!);
			} else {
				const msg = new URL(data.request.responseURL).searchParams.get("msg") || "";
				if (msg.includes("Connection initialized")) {
					navigate(`/projects/${projectId}/connections`);
				}
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

	const handleGoogleOAuth = async () => {
		if (!isConnectionNameValid) {
			triggerParentFormSubmit();
			return;
		}
		const { data: connectionId } = await ConnectionService.create(projectId!, "github", connectionName!);

		window.open(`${baseUrl}/oauth/start/google?cid=${connectionId}`, "_blank");
	};

	const renderOAuthButton = () => (
		<>
			<p className="text-lg">{t("information")}:</p>
			<div className="flex flex-col items-start gap-2 mt-2">
				{infoGoogleUserLinks.map(({ url, text }, idx) => (
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
				{isLoading ? <Spinner /> : <FloppyDiskIcon className="w-5 h-5 transition fill-white" />}{" "}
				{t("buttons.saveConnection")}
			</Button>
			<p className="text-lg">{t("information")}:</p>
			<div className="flex flex-col items-start gap-2 mt-2">
				{infoGoogleAccountLinks.map(({ url, text }, idx) => (
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
	);

	return (
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
				{selectedConnectionType && selectedConnectionType === GoogleConnectionType.ServiceAccount
					? renderServiceAccount()
					: null}
			</div>
		</form>
	);
};
