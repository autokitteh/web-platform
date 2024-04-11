import React, { useState } from "react";
import { TestS } from "@assets/image";
import { Select, Input, Textarea, Button, ErrorMessage, Toast } from "@components/atoms";
import { TabFormHeader } from "@components/molecules";
import { optionsSelectApp } from "@constants/lists";
import { zodResolver } from "@hookform/resolvers/zod";
import { ISelectAppChangeForm } from "@interfaces/components";
import { newConnectionSchema } from "@validations";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export const AddConnectionForm = () => {
	const { t: tError } = useTranslation("errors");
	const { t } = useTranslation("tabs", { keyPrefix: "connections.form" });
	const [selectedApp, setSelectedApp] = useState<{ [key: string]: string }>({});
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	const {
		register,
		handleSubmit,
		formState: { errors, dirtyFields },
		control,
		reset,
	} = useForm({
		resolver: zodResolver(newConnectionSchema),
		defaultValues: {
			connectionApp: { value: "", label: "" },
			userName: "",
			password: "",
			connectionName: "",
			specificField: "",
		},
	});
	const handleSelectChange = ({ name, value }: ISelectAppChangeForm) => {
		setSelectedApp((prevState) => ({
			...prevState,
			[name]: value,
		}));
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

	const inputClass = (field: keyof typeof dirtyFields) => (dirtyFields[field] ? "border-white" : "");

	return (
		<div className="min-w-550">
			<TabFormHeader
				className="mb-11"
				form="createNewConnectionForm"
				isLoading={isLoading}
				title={t("addNewConnection")}
			/>
			<form className="flex items-start gap-10" id="createNewConnectionForm" onSubmit={handleSubmit(onSubmit)}>
				<div className="flex flex-col gap-6 w-full">
					<div className="relative">
						<Controller
							control={control}
							name="connectionApp"
							render={({ field }) => (
								<Select
									{...field}
									aria-label={t("placeholders.selectApp")}
									isError={!!errors.connectionApp}
									onChange={(selected) => {
										field.onChange(selected);
										handleSelectChange({ name: "connectionApp", value: selected?.value || "" });
									}}
									options={optionsSelectApp}
									placeholder={t("placeholders.selectApp")}
									value={field.value}
								/>
							)}
						/>
						<ErrorMessage>{errors.connectionApp?.message as string}</ErrorMessage>
					</div>
					<div className="relative">
						<Input
							aria-label={t("placeholders.userName")}
							{...register("userName")}
							className={inputClass("userName")}
							isError={!!errors.userName}
							placeholder={t("placeholders.userName")}
						/>
						<ErrorMessage>{errors.userName?.message as string}</ErrorMessage>
					</div>
					<div className="relative">
						<Input
							aria-label={t("placeholders.password")}
							{...register("password")}
							className={inputClass("password")}
							isError={!!errors.password}
							placeholder={t("placeholders.password")}
						/>
						<ErrorMessage>{errors.password?.message as string}</ErrorMessage>
					</div>
					<div className="relative">
						<Input
							aria-label={t("placeholders.nameNewConnection")}
							{...register("connectionName")}
							className={inputClass("connectionName")}
							isError={!!errors.connectionName}
							placeholder={t("placeholders.nameNewConnection")}
						/>
						<ErrorMessage>{errors.connectionName?.message as string}</ErrorMessage>
					</div>
					{selectedApp.connectionApp === "temporal" ? (
						<div className="relative">
							<Textarea
								{...register("specificField")}
								className={inputClass("specificField")}
								isError={!!errors.specificField}
								rows={4}
							/>
							<ErrorMessage>{errors.specificField?.message as string}</ErrorMessage>
						</div>
					) : null}
				</div>

				<Button
					aria-label={t("buttons.testConnection")}
					className="text-white border-white w-auto whitespace-nowrap hover:bg-black px-3"
					disabled={isLoading}
					type="submit"
					variant="outline"
				>
					<TestS className="w-5 h-4 transition fill-white" />
					{isLoading ? t("buttons.testing") + "..." : t("buttons.testConnection")}
				</Button>
			</form>
			<Toast
				className="border-error"
				duration={5}
				isOpen={toast.isOpen}
				onClose={() => setToast({ ...toast, isOpen: false })}
			>
				<p className="font-semibold text-error">{tError("error")}</p>
				<p className="mt-1 text-xs">{toast.message}</p>
			</Toast>
		</div>
	);
};
