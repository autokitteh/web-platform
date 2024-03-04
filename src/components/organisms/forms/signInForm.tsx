import React from "react";
import { Input, Button, ErrorMessage } from "@components/atoms";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

export const SignInForm = () => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();
	const { t } = useTranslation("login");

	const onSubmit = () => {};

	return (
		<form className="flex flex-col items-start gap-8 w-full" onSubmit={handleSubmit(onSubmit)}>
			<div className="flex flex-col gap-6 w-full">
				<div className="relative">
					<Input
						{...register("email", { required: t("form.emailError") })}
						classInput="placeholder:text-gray-400 hover:placeholder:text-gray-800"
						className="bg-white border-gray-400 hover:border-gray-700"
						isError={!!errors.email}
						isRequired
						placeholder={t("form.placoholderEmail")}
					/>
					<ErrorMessage>{errors.email?.message as string}</ErrorMessage>
				</div>
				<div className="relative">
					<Input
						{...register("password", {
							required: t("form.passwordError"),
							minLength: { value: 8, message: t("form.passwordError") },
						})}
						classInput="placeholder:text-gray-400 hover:placeholder:text-gray-800"
						className="bg-white border-gray-400 hover:border-gray-700"
						isError={!!errors.password}
						isRequired
						placeholder={t("form.placoholderPassword")}
					/>
					<ErrorMessage>{errors.password?.message as string}</ErrorMessage>
				</div>
			</div>

			<Button
				className="justify-center text-base font-semibold hover:bg-green-light py-4 px-3 rounded-full border-gray-800"
				type="submit"
				variant="outline"
			>
				{t("form.continueEmail")}
			</Button>
		</form>
	);
};
