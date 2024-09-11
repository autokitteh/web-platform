import React, { useEffect, useState } from "react";

import randomatic from "randomatic";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { infoGithubLinks } from "@constants/lists";
import { VariablesService } from "@services";
import { useToastStore } from "@src/store";
import { getApiBaseUrl } from "@src/utilities";

import { Button, ErrorMessage, Input, Link, SecretInput, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { CopyIcon, ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const PatForm = ({
	copyToClipboard,
	errors,
	isLoading,
	mode,
	register,
	setValue,
}: {
	copyToClipboard: (webhookUrlPath: string) => void;
	errors: FieldErrors<any>;
	isLoading: boolean;
	mode: "create" | "edit";
	register: UseFormRegister<{ [x: string]: any }>;
	setValue: any;
}) => {
	const [lockState, setLockState] = useState<{ pat: boolean; secret: boolean }>({
		pat: true,
		secret: true,
	});
	const addToast = useToastStore((state) => state.addToast);

	const { connectionId } = useParams();

	const apiBaseUrl = getApiBaseUrl();

	const { t } = useTranslation("integrations");
	const [webhook, setWebhook] = useState("");
	const isEditMode = mode === "edit";

	const getWebhookOnInit = async () => {
		if (!connectionId) {
			setWebhook(`${apiBaseUrl}/${randomatic("Aa0", 8)}`);

			return;
		}
		const { data: connectionVariables, error } = await VariablesService.list(connectionId);

		if (error) {
			addToast({
				message: (error as Error).message,
				type: "error",
			});
		}

		const webhookKey = connectionVariables?.find((variable) => variable.name === "pat_key")?.value;
		if (webhookKey) {
			setWebhook(`${apiBaseUrl}/${webhookKey}`);

			return;
		}

		setWebhook(`${apiBaseUrl}/${randomatic("Aa0", 8)}`);
	};

	useEffect(() => {
		getWebhookOnInit();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (webhook) {
			setValue("webhook", webhook);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [webhook]);

	return (
		<>
			<div className="relative">
				{isEditMode ? (
					<SecretInput
						{...register("pat")}
						aria-label={t("github.placeholders.pat")}
						handleInputChange={(newPatValue) => setValue("pat", newPatValue)}
						handleLockAction={(newLockState: boolean) =>
							setLockState((prevState) => ({ ...prevState, pat: newLockState }))
						}
						isError={!!errors.pat}
						isLocked={lockState.pat}
						isRequired
						label={t("github.placeholders.pat")}
					/>
				) : (
					<Input
						{...register("pat")}
						aria-label={t("github.placeholders.pat")}
						isError={!!errors.pat}
						isRequired
						label={t("github.placeholders.pat")}
					/>
				)}

				<ErrorMessage>{errors.pat?.message as string}</ErrorMessage>
			</div>
			<div className="relative flex gap-2">
				<Input
					{...register("webhook")}
					aria-label={t("github.placeholders.webhookUrl")}
					className="w-full"
					disabled
					label={t("github.placeholders.webhookUrl")}
					value={webhook}
				/>

				<Button
					aria-label={t("buttons.copy")}
					className="w-fit rounded-md border-black bg-white px-5 font-semibold hover:bg-gray-950"
					onClick={() => copyToClipboard(webhook)}
					variant="outline"
				>
					<CopyIcon className="h-3.5 w-3.5 fill-black" />

					{t("buttons.copy")}
				</Button>
			</div>
			<div className="relative">
				{isEditMode ? (
					<SecretInput
						{...register("secret")}
						aria-label={t("github.placeholders.secret")}
						handleInputChange={(newSecretValue) => setValue("secret", newSecretValue)}
						handleLockAction={(newLockState: boolean) =>
							setLockState((prevState) => ({ ...prevState, secret: newLockState }))
						}
						isError={!!errors.secret}
						isLocked={lockState.secret}
						label={t("github.placeholders.secret")}
					/>
				) : (
					<Input
						{...register("secret")}
						aria-label={t("github.placeholders.secret")}
						isError={!!errors.secret}
						label={t("github.placeholders.secret")}
					/>
				)}

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
					{infoGithubLinks.map(({ text, url }, index) => (
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
};
