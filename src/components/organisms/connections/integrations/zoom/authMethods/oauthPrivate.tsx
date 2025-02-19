import React, { useState } from "react";

import { FieldErrors, UseFormRegister, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button, ErrorMessage, Input, SecretInput, Spinner } from "@components/atoms";

const initialLockState: Record<string, boolean> = {
	clientSecret: true,
	webhookSecret: true,
};

const formFields = [
	{ name: "account_id", translate: "accountId", requiresSecret: false, isRequired: true },
	{ name: "client_id", translate: "clientId", requiresSecret: false, isRequired: true },
	{ name: "client_secret", translate: "clientSecret", requiresSecret: true, isRequired: false },
];

interface ZoomOauthPrivateFormProps {
	control: any;
	errors: FieldErrors<any>;
	isLoading: boolean;
	mode: "create" | "edit";
	register: UseFormRegister<{ [key: string]: any }>;
	setValue: (name: string, value: any) => void;
}

export const ZoomOauthPrivateForm: React.FC<ZoomOauthPrivateFormProps> = ({
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
			{formFields.map(({ name, translate, requiresSecret, isRequired }) => {
				const label = t(`zoom.placeholders.${translate}`);
				const error = errors[name]?.message as string;
				const commonProps = {
					...register(name),
					"aria-label": label,
					"isError": !!errors[name],
					"isRequired": isRequired,
					label,
					"value": values[name as any],
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
				className="ml-auto w-fit border-black bg-white px-3 font-medium hover:bg-gray-950 hover:text-white"
				disabled={isLoading}
				type="submit"
				variant="outline"
			>
				{isLoading ? <Spinner /> : null}
				{t("buttons.startOAuthFlow")}
			</Button>
		</>
	);
};
