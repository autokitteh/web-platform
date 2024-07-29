import React, { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { namespaces } from "@constants";
import { selectIntegrationAws } from "@constants/lists/connections";
import { HttpService, LoggerService } from "@services";
import { awsIntegrationSchema } from "@validations";

import { useToastStore } from "@store";

import { Button, ErrorMessage, Input, Select, Spinner } from "@components/atoms";

import { FloppyDiskIcon } from "@assets/image/icons";

export const AwsIntegrationAddForm = ({
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
	const [isLoading, setIsLoading] = useState(false);

	const {
		control,
		formState: { errors },
		getValues,
		handleSubmit,
		register,
	} = useForm({
		resolver: zodResolver(awsIntegrationSchema),
		defaultValues: {
			region: { value: "", label: "" },
			accessKey: "",
			secretKey: "",
			token: "",
		},
	});

	const createConnection = async () => {
		setIsLoading(true);
		const { accessKey, region, secretKey, token } = getValues();

		try {
			await HttpService.post(`/aws/save?cid=${connectionId}&origin=web`, {
				name: region.value,
				access_key: accessKey,
				secret_key: secretKey,
				token,
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
		connectionId && createConnection();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

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
		<form className="flex w-full flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
			<div className="relative">
				<Controller
					control={control}
					name="region"
					render={({ field }) => (
						<Select
							aria-label={t("aws.placeholders.region")}
							isError={!!errors.region}
							onChange={(selected) => field.onChange(selected)}
							options={selectIntegrationAws}
							placeholder={t("aws.placeholders.region")}
							value={field.value}
						/>
					)}
				/>

				<ErrorMessage>{errors.region?.message as string}</ErrorMessage>
			</div>

			<div className="relative">
				<Input
					{...register("accessKey")}
					aria-label={t("aws.placeholders.accessKey")}
					isError={!!errors.accessKey}
					isRequired
					placeholder={t("aws.placeholders.accessKey")}
				/>

				<ErrorMessage>{errors.accessKey?.message as string}</ErrorMessage>
			</div>

			<div className="relative">
				<Input
					{...register("secretKey")}
					aria-label={t("aws.placeholders.secretKey")}
					isError={!!errors.secretKey}
					isRequired
					placeholder={t("aws.placeholders.secretKey")}
				/>

				<ErrorMessage>{errors.secretKey?.message as string}</ErrorMessage>
			</div>

			<div className="relative">
				<Input
					{...register("token")}
					aria-label={t("aws.placeholders.token")}
					isError={!!errors.token}
					isRequired
					placeholder={t("aws.placeholders.token")}
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
		</form>
	);
};
