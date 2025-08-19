import React, { useState } from "react";

import { useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { ZoomServerToServerFormProps } from "@interfaces/components";

import { Button, ErrorMessage, Input, SecretInput, Spinner } from "@components/atoms";

import { ExternalLinkIcon } from "@assets/image/icons";

const initialLockState: Record<string, boolean> = {
	clientSecret: true,
};

const formFields = [
	{ name: "account_id", translate: "accountId", requiresSecret: false, isRequired: true },
	{ name: "client_id", translate: "clientId", requiresSecret: false, isRequired: true },
	{ name: "client_secret", translate: "clientSecret", requiresSecret: true, isRequired: true },
];

export const ZoomServerToServerForm = ({
	control,
	errors,
	isLoading,
	mode,
	register,
	setValue,
}: ZoomServerToServerFormProps) => {
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
					disabled: isLoading,
					"aria-label": label,
					isError: !!errors[name],
					isRequired: isRequired,
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
