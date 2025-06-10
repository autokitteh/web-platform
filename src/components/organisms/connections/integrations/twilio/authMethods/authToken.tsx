import React, { useEffect, useState } from "react";

import { Control, FieldErrors, UseFormRegister, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { infoTwilioAuthTokenLinks } from "@constants/lists/connections/integrationInfoLinks.constants";

import { Button, ErrorMessage, Input, SecretInput, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

const initialLockState: Record<string, boolean> = {
	token: true,
};

interface FormValues {
	sid: string;
	token: string;
}

const formFields = [
	{ name: "sid", translate: "sid", requiresSecret: false },
	{ name: "token", translate: "token", requiresSecret: true },
] as const;

interface TwilioAuthTokenFormProps {
	control: Control<FormValues>;
	errors: FieldErrors<FormValues>;
	isLoading: boolean;
	mode: "create" | "edit";
	patWebhookKey: string;
	register: UseFormRegister<FormValues>;
	setValue: (name: string, value: any) => void;
}

export const TwilioAuthTokenForm = ({
	control,
	errors,
	isLoading,
	mode,
	patWebhookKey,
	register,
	setValue,
}: TwilioAuthTokenFormProps) => {
	const [lockState, setLockState] = useState(initialLockState);
	const { t } = useTranslation("integrations");
	const isEditMode = mode === "edit";

	const values = useWatch({
		control,
		name: formFields.map((f) => f.name),
	});

	const handleLockAction = (fieldName: string, newLockState: boolean) => {
		setLockState((prev) => ({ ...prev, [fieldName]: newLockState }));
	};

	useEffect(() => {
		if (patWebhookKey) {
			setValue("webhook", patWebhookKey);
		}
	}, [patWebhookKey, setValue]);

	return (
		<>
			{formFields.map(({ name, translate, requiresSecret }) => {
				const label = t(`twilio.placeholders.${translate}`);
				const error = errors[name]?.message as string;
				const commonProps = {
					...register(name),
					"aria-label": label,
					disabled: isLoading,
					isError: !!errors[name],
					isRequired: true,
					label,
					value: values[name as any],
				};

				return (
					<div className="relative" key={name}>
						{isEditMode && requiresSecret ? (
							<SecretInput
								type="password"
								{...commonProps}
								handleInputChange={(newValue) => setValue(name, newValue)}
								handleLockAction={(newLockState) => handleLockAction(name, newLockState)}
								isLocked={lockState[name]}
							/>
						) : (
							<Input {...commonProps} />
						)}
						<ErrorMessage>{error}</ErrorMessage>
					</div>
				);
			})}

			<Accordion title={t("information")}>
				<div className="flex flex-col gap-2">
					{infoTwilioAuthTokenLinks.map(({ text, url }, index: number) => (
						<Link
							className="inline-flex items-center gap-2.5 text-green-800"
							key={index}
							target="_blank"
							to={url}
						>
							{text}
							<ExternalLinkIcon className="size-3.5 fill-green-800 duration-200" />
						</Link>
					))}
				</div>
			</Accordion>

			<Button
				aria-label={t("buttons.saveConnection")}
				className="ml-auto w-fit border-white px-3 font-medium text-white hover:bg-black"
				disabled={isLoading}
				type="submit"
				variant="outline"
			>
				{isLoading ? <Spinner /> : <FloppyDiskIcon className="size-5 fill-white transition" />}
				{t("buttons.saveConnection")}
			</Button>
		</>
	);
};
