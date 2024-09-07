import React, { useState } from "react";

import { Controller, FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { infoCronExpressionsLinks } from "@constants";
import { SelectOption } from "@interfaces/components";
import { TriggersService } from "@services";
import { TriggerTypes } from "@src/enums";
import { TriggerFormData, triggerResolver } from "@validations";

import { useFetchConnections, useFileOperations } from "@hooks";
import { useToastStore } from "@store";

import { Button, ErrorMessage, Input, Link, Loader } from "@components/atoms";
import { Accordion, Select, TabFormHeader } from "@components/molecules";

import { CopyIcon, ExternalLinkIcon } from "@assets/image/icons";

const CommonFields = ({ connections }: { connections: SelectOption[] }) => {
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const {
		control,
		formState: { errors },
		register,
	} = useFormContext<TriggerFormData>();

	return (
		<>
			<div className="relative">
				<Input
					aria-label={t("placeholders.name")}
					{...register("name")}
					isError={!!errors.name}
					label={t("placeholders.name")}
				/>

				<ErrorMessage>{errors.name?.message?.toString() || ""}</ErrorMessage>
			</div>

			<div className="relative">
				<Controller
					control={control}
					name="connection"
					render={({ field }) => (
						<Select
							{...field}
							aria-label={t("placeholders.selectConnection")}
							dataTestid="select-trigger-type"
							isError={!!errors.connection}
							label={t("placeholders.connection")}
							noOptionsLabel={t("noConnectionsAvailable")}
							options={connections}
							placeholder={t("placeholders.selectConnection")}
						/>
					)}
				/>

				<ErrorMessage>{errors.connection?.message?.toString() || ""}</ErrorMessage>
			</div>
		</>
	);
};

const WebhookFields = () => {
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const { t: tGlobal } = useTranslation("global");

	return (
		<div className="relative flex gap-2">
			<Input
				aria-label={t("placeholders.webhookUrl")}
				className="w-full"
				disabled
				label={t("placeholders.webhookUrl")}
				placeholder="The webhook URL will be generated after saving the trigger."
			/>

			<Button
				aria-label={tGlobal("copy")}
				className="w-fit rounded-md border-black bg-white px-5 font-semibold hover:bg-gray-950"
				disabled
				variant="outline"
			>
				<CopyIcon className="h-3.5 w-3.5 fill-black" />

				{tGlobal("copy")}
			</Button>
		</div>
	);
};

const TriggerSpecificFields = ({ filesNameList }: { filesNameList: SelectOption[] }) => {
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const {
		control,
		formState: { errors },
		register,
	} = useFormContext<TriggerFormData>();

	return (
		<>
			<div className="relative">
				<Controller
					control={control}
					name="filePath"
					render={({ field }) => (
						<Select
							{...field}
							aria-label={t("placeholders.selectFile")}
							dataTestid="select-file"
							isError={!!errors.filePath}
							label={t("placeholders.file")}
							noOptionsLabel={t("noFilesAvailable")}
							options={filesNameList}
							placeholder={t("placeholders.selectFile")}
						/>
					)}
				/>

				<ErrorMessage>{errors.filePath?.message?.toString() || ""}</ErrorMessage>
			</div>

			<div className="relative">
				<Input
					aria-label={t("placeholders.functionName")}
					isError={!!errors.entryFunction}
					label={t("placeholders.functionName")}
					{...register("entryFunction")}
				/>

				<ErrorMessage>{errors.entryFunction?.message?.toString() || ""}</ErrorMessage>
			</div>

			<Accordion className="mt-4" title={t("information")}>
				<div className="flex flex-col items-start gap-2">
					{infoCronExpressionsLinks.map(({ text, url }, index) => (
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
		</>
	);
};

const ConnectionTypeFields = () => {
	const connectionType = useWatch({ name: "connection.value" });

	if (connectionType === TriggerTypes.webhook) {
		return <WebhookFields />;
	}

	return null;
};

export const AddTrigger = () => {
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const { t: tErrors } = useTranslation("errors");
	const navigate = useNavigate();
	const { projectId } = useParams<{ projectId: string }>();
	const [isSaving, setIsSaving] = useState(false);
	const addToast = useToastStore((state) => state.addToast);

	const { isLoading: isLoadingConnections } = useFetchConnections(projectId!);
	const { fetchResources } = useFileOperations(projectId!);
	const [filesNameList, setFilesNameList] = useState<SelectOption[]>([]);
	const [isLoadingFiles, setIsLoadingFiles] = useState(false);
	const { connections } = useFetchConnections(projectId!);

	const methods = useForm<TriggerFormData>({
		defaultValues: {
			name: "",
			connection: { label: "", value: "" },
			filePath: { label: "", value: "" },
			entryFunction: "",
			cron: "",
		},
		resolver: triggerResolver,
	});

	const {
		formState: { errors },
		handleSubmit,
		register,
	} = methods;

	React.useEffect(() => {
		const loadFiles = async () => {
			setIsLoadingFiles(true);
			try {
				const resources = await fetchResources();
				const formattedResources = Object.keys(resources).map((name) => ({
					label: name,
					value: name,
				}));
				setFilesNameList(formattedResources);
			} catch (error) {
				addToast({
					id: Date.now()?.toString(),
					message: tErrors("resourcesFetchError"),
					type: "error",
				});
			} finally {
				setIsLoadingFiles(false);
			}
		};

		loadFiles();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onSubmit = async (data: TriggerFormData) => {
		setIsSaving(true);
		try {
			const { error } = await TriggersService.create(projectId!, {
				sourceType: data.connection.value as TriggerTypes,
				name: data.name,
				path: data.filePath.value,
				entryFunction: data.entryFunction,
				schedule: data.cron,
				eventType: "",
				triggerId: undefined,
			});

			if (error) {
				addToast({
					id: Date.now()?.toString(),
					message: tErrors("triggerNotCreated"),
					type: "error",
				});

				return;
			}

			addToast({
				id: Date.now()?.toString(),
				message: t("createdSuccessfully"),
				type: "success",
			});
			navigate(`/projects/${projectId}/triggers`);
		} catch (error) {
			addToast({
				id: Date.now()?.toString(),
				message: tErrors("triggerNotCreated"),
				type: "error",
			});
		} finally {
			setIsSaving(false);
		}
	};

	const connectionType = useWatch({ control: methods.control, name: "connection.value" });

	if (isLoadingConnections || isLoadingFiles) {
		return <Loader isCenter size="xl" />;
	}

	return (
		<FormProvider {...methods}>
			<div className="min-w-80">
				<TabFormHeader className="mb-10" form="triggerForm" isLoading={isSaving} title={t("addNewTrigger")} />

				<form className="flex flex-col gap-6" id="triggerForm" onSubmit={handleSubmit(onSubmit)}>
					<CommonFields connections={connections} />

					<ConnectionTypeFields />

					{connectionType === TriggerTypes.schedule ? (
						<div className="relative">
							<Input
								aria-label={t("placeholders.cron")}
								{...register("cron")}
								isError={!!errors.cron}
								label={t("placeholders.cron")}
							/>

							<ErrorMessage>{errors.cron?.message?.toString() || ""}</ErrorMessage>
						</div>
					) : null}

					<TriggerSpecificFields filesNameList={filesNameList} />
				</form>
			</div>
		</FormProvider>
	);
};
