import React, { useState } from "react";

import { FieldErrors, UseFormRegister, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button, ErrorMessage, Input, SecretInput, Spinner } from "@components/atoms";

import { ExternalLinkIcon } from "@assets/image/icons";

const initialLockState: Record<string, boolean> = {
	clientSecret: true,
	webhookSecret: true,
	signingSecret: true,
};

const formFields = [
	{ name: "client_id", translate: "clientId", requiresSecret: false },
	{ name: "client_secret", translate: "clientSecret", requiresSecret: true },
	{ name: "signing_secret", translate: "signingSecret", requiresSecret: true },
] as const;

interface SlackOauthPrivateFormProps {
	control: any;
	errors: FieldErrors<any>;
	isLoading: boolean;
	mode: "create" | "edit";
	register: UseFormRegister<{ [key: string]: any }>;
	setValue: (name: string, value: any) => void;
}

export const SlackOauthPrivateForm: React.FC<SlackOauthPrivateFormProps> = ({
	control,
	errors,
	isLoading,
	mode,
	register,
	setValue,
}) => {
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

	return (
		<>
			{formFields.map(({ name, translate, requiresSecret }) => {
				const label = t(`slack.placeholders.${translate}`);
				const error = errors[name]?.message as string;
				const commonProps = {
					...register(name),
					disabled: isLoading,
					"aria-label": label,
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

			<Button
				aria-label={t("buttons.startOAuthFlow")}
				className="ml-auto w-fit border-white px-3 font-medium text-white hover:bg-black"
				disabled={isLoading}
				type="submit"
				variant="outline"
			>
				{isLoading ? <Spinner /> : <ExternalLinkIcon className="size-4 fill-white transition" />}
				{t("buttons.startOAuthFlow")}
			</Button>
		</>
	);
};
