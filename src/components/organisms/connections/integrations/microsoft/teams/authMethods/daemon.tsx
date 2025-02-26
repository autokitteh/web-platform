import React, { useState } from "react";

import { FieldErrors, UseFormRegister, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button, ErrorMessage, Input, SecretInput, Spinner } from "@components/atoms";

const initialLockState: Record<string, boolean> = {
	client_id: false,
	client_secret: true,
	tenant_id: true,
};

const formFields = [
	{ name: "client_id", translate: "clientId", requiresSecret: false },
	{ name: "client_secret", translate: "clientSecret", requiresSecret: true },
	{ name: "tenant_id", translate: "tenantId", requiresSecret: true },
] as const;

interface MicrosoftTeamsDaemonFormProps {
	control: any;
	errors: FieldErrors<any>;
	isLoading: boolean;
	mode: "create" | "edit";
	register: UseFormRegister<{ [key: string]: any }>;
	setValue: (name: string, value: any) => void;
}

export const MicrosoftTeamsDaemonForm = ({
	control,
	errors,
	isLoading,
	mode,
	register,
	setValue,
}: MicrosoftTeamsDaemonFormProps) => {
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
				const label = t(`teams.placeholders.${translate}`);
				const error = errors[name]?.message as string;
				const commonProps = {
					...register(name),
					"aria-label": label,
					"isError": !!errors[name],
					"isRequired": true,
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
				aria-label={t("buttons.saveConnection")}
				className="ml-auto w-fit border-black bg-white px-3 font-medium hover:bg-gray-950 hover:text-white"
				type="submit"
				variant="outline"
			>
				{isLoading ? <Spinner /> : null}
				{t("buttons.saveConnection")}
			</Button>
		</>
	);
};
