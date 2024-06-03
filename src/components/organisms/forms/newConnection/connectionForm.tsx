import React, { useState } from "react";
import { Select, ErrorMessage, Toast } from "@components/atoms";
import { TabFormHeader } from "@components/molecules";
import { IntegrationGithubForm } from "@components/organisms/forms";
import { optionsSelectApp } from "@constants/lists";
import { ConnectionApp } from "@enums/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { connectionSchema } from "@validations";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export const AddConnectionForm = () => {
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("tabs", { keyPrefix: "connections.form" });
	const [selectedApp, setSelectedApp] = useState<string>();
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});

	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	const {
		handleSubmit,
		formState: { errors },
		control,
		reset,
	} = useForm({
		resolver: zodResolver(connectionSchema),
		defaultValues: {
			integration: { value: "", label: "" },
		},
	});
	const handleSelectApp = (value?: string) => {
		setSelectedApp(value);
	};

	const onSubmit = () => {
		setIsLoading(true);
		setToast({ isOpen: true, message: "message" });
		setTimeout(() => {
			setIsLoading(false);
			navigate(-1);
			reset();
		}, 3000);
	};

	return (
		<div className="min-w-80">
			<TabFormHeader
				className="mb-11"
				form="createNewConnectionForm"
				isLoading={isLoading}
				title={t("addNewConnection")}
			/>
			<form className="flex items-start gap-10 mb-5" id="createNewConnectionForm" onSubmit={handleSubmit(onSubmit)}>
				<div className="relative w-full">
					<Controller
						control={control}
						name="integration"
						render={({ field }) => (
							<Select
								{...field}
								aria-label={t("placeholders.selectApp")}
								isError={!!errors.integration}
								onChange={(selected) => {
									field.onChange(selected);
									handleSelectApp(selected?.value);
								}}
								options={optionsSelectApp}
								placeholder={t("placeholders.selectApp")}
								value={field.value}
							/>
						)}
					/>
					<ErrorMessage>{errors.integration?.message as string}</ErrorMessage>
				</div>
			</form>
			{selectedApp === ConnectionApp.github ? <IntegrationGithubForm /> : null}
			<Toast
				duration={5}
				isOpen={toast.isOpen}
				onClose={() => setToast({ ...toast, isOpen: false })}
				title={tErrors("error")}
				type="error"
			>
				<p className="mt-1 text-xs">{toast.message}</p>
			</Toast>
		</div>
	);
};
