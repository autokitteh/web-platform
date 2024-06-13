import React, { useState } from "react";
import { FloppyDiskIcon } from "@assets/image/icons";
import { Select, Button, ErrorMessage, Input, Spinner } from "@components/atoms";
import { selectIntegrationAws } from "@constants/lists";
import { zodResolver } from "@hookform/resolvers/zod";
import { awsIntegrationSchema } from "@validations";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

export const AWSIntegrationForm = () => {
	const { t } = useTranslation("integrations");

	const [isLoading, setIsLoading] = useState(false);

	const {
		handleSubmit,
		formState: { errors },
		register,
		control,
	} = useForm({
		resolver: zodResolver(awsIntegrationSchema),
		defaultValues: {
			region: { value: "", label: "" },
			accessKey: "",
			secretKey: "",
			token: "",
		},
	});

	const onSubmit = () => {
		setIsLoading(true);
		setTimeout(() => {
			setIsLoading(false);
		}, 3000);
	};

	return (
		<form className="flex items-start gap-10" onSubmit={handleSubmit(onSubmit)}>
			<div className="flex flex-col w-full gap-6">
				<div className="relative">
					<Controller
						control={control}
						name="region"
						render={({ field }) => (
							<Select
								aria-label={t("aws.placeholders.region")}
								isError={!!errors.region}
								onChange={(selected) => field.onChange(selected as any)}
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
					className="px-3 ml-auto font-medium text-white border-white hover:bg-black w-fit"
					disabled={isLoading}
					type="submit"
					variant="outline"
				>
					{isLoading ? <Spinner /> : <FloppyDiskIcon className="w-5 h-5 transition fill-white" />}
					{t("buttons.saveConnection")}
				</Button>
			</div>
		</form>
	);
};
