import React, { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Sentry from "@sentry/react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { userFeedbackSchema } from "@validations";

import { Button, ErrorMessage, IconButton, Input, Loader, Textarea, Typography } from "@components/atoms";

import { Close } from "@assets/image/icons";

export const UserFeedbackForm = () => {
	const { t } = useTranslation("global", { keyPrefix: "userFeedback" });
	const [isSendingFeedback, setIsSendingFeedback] = useState(false);

	const {
		formState: { errors },
		handleSubmit,
		register,
	} = useForm({
		mode: "onChange",
		defaultValues: {
			name: "",
			email: "",
			comment: "",
		},
		resolver: zodResolver(userFeedbackSchema),
	});

	const onSubmit = async (data: { comment: string; email: string; name: string }) => {
		try {
			setIsSendingFeedback(true);

			const { comment, email, name } = data;
			const sentryId = Sentry.captureMessage("Message that needs user feedback");

			const userFeedback = {
				event_id: sentryId,
				name,
				email,
				message: comment,
			};

			Sentry.captureFeedback(userFeedback);
		} catch (error) {
			Sentry.captureException(error);
		} finally {
			setIsSendingFeedback(false);
		}
	};

	return (
		<div className="w-96 rounded-t-3xl border border-gray-750 bg-gray-1100 p-6">
			<div className="flex items-center justify-between gap-1">
				<Typography className="font-averta font-bold" size="2xl">
					{t("title")}
				</Typography>
				<IconButton className="group ml-auto h-default-icon w-default-icon bg-gray-1250 p-0">
					<Close className="size-3 fill-gray-750 transition group-hover:fill-white" />
				</IconButton>
			</div>
			<form className="mt-5" onSubmit={handleSubmit(onSubmit)}>
				<Input
					label={t("form.name")}
					placeholder={t("form.placeholder.name")}
					{...register("name")}
					isError={!!errors.name}
					isRequired
				/>
				{errors.name ? <ErrorMessage>{errors.name.message}</ErrorMessage> : null}

				<Input
					className="mt-6"
					isRequired
					label={t("form.email")}
					placeholder={t("form.placeholder.email")}
					{...register("email")}
					isError={!!errors.email}
				/>
				{errors.email ? <ErrorMessage>{errors.email.message}</ErrorMessage> : null}

				<Textarea
					rows={5}
					{...register("comment")}
					className="mt-6"
					isError={!!errors.comment}
					isRequired
					label={t("form.comment")}
					placeholder={t("form.placeholder.comment")}
				/>
				{errors.comment ? <ErrorMessage>{errors.comment.message}</ErrorMessage> : null}

				<Button
					className="mt-6 w-full justify-center p-1.5 text-lg font-bold text-white"
					disabled={isSendingFeedback}
					type="submit"
					variant="outline"
				>
					{isSendingFeedback ? <Loader className="m-0" /> : null}
					{t("form.buttons.send")}
				</Button>
			</form>
		</div>
	);
};
