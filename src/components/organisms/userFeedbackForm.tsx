import React, { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Sentry from "@sentry/react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { LoggerService } from "@services/logger.service";
import { namespaces } from "@src/constants";
import { UserFeedbackFormProps } from "@src/interfaces/components";
import { useToastStore } from "@src/store";
import { cn } from "@src/utilities";
import { userFeedbackSchema } from "@validations";

import { Button, ErrorMessage, IconButton, Input, Loader, Textarea, Typography } from "@components/atoms";

import { CatLookAtFishImage } from "@assets/image";
import { Close } from "@assets/image/icons";

export const UserFeedbackForm = ({ className, isOpen, onClose }: UserFeedbackFormProps) => {
	const { t } = useTranslation("global", { keyPrefix: "userFeedback" });
	const { t: tErrors } = useTranslation("errors");
	const addToast = useToastStore((state) => state.addToast);
	const [isSendingFeedback, setIsSendingFeedback] = useState(false);
	const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);
	const [timerCount, setTimerCount] = useState(10);

	const {
		formState: { errors },
		handleSubmit,
		register,
		reset,
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
		if (isFeedbackSubmitted) {
			onClose();

			return;
		}
		try {
			setIsSendingFeedback(true);
			const { comment, email, name } = data;
			const sentryId = Sentry.captureMessage("Message that needs user feedback");
			const userFeedback = { event_id: sentryId, name, email, message: comment };

			Sentry.captureFeedback(userFeedback);

			setIsFeedbackSubmitted(true);
			setTimerCount(10);
		} catch (error) {
			Sentry.captureException(error);
			addToast({
				message: tErrors("errorSendingFeedback"),
				type: "error",
			});
			LoggerService.error(namespaces.feedbackForm, tErrors("errorSendingFeedbackExtended", { error }));
		} finally {
			setIsSendingFeedback(false);
		}
	};

	useEffect(() => {
		if (!isFeedbackSubmitted) return;
		const interval = setInterval(() => {
			setTimerCount((count) => count - 1);
		}, 1000);

		return () => clearInterval(interval);
	}, [isFeedbackSubmitted]);

	useEffect(() => {
		if (timerCount === 0) onClose();
	}, [timerCount, onClose]);

	useEffect(() => {
		if (!isOpen) {
			setIsFeedbackSubmitted(false);
			setTimerCount(10);
			reset();
		}
	}, [isOpen, reset]);

	if (!isOpen) return null;

	return (
		<div className={cn("h-500 w-96 rounded-t-3xl border border-gray-750 bg-gray-1100 p-6 z-[500]", className)}>
			<div className="flex items-center justify-between gap-1">
				<Typography className="font-averta font-bold" size="2xl">
					{t("title")}
				</Typography>
				<IconButton className="group ml-auto h-default-icon w-default-icon bg-gray-1250 p-0" onClick={onClose}>
					<Close className="size-3 fill-gray-750 transition group-hover:fill-white" />
				</IconButton>
			</div>
			<form className="mt-5 flex h-350 flex-col justify-between" onSubmit={handleSubmit(onSubmit)}>
				{!isFeedbackSubmitted ? (
					<div>
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
					</div>
				) : (
					<div className="my-auto text-center">
						<Typography className="font-averta font-bold leading-7" size="1.5xl">
							{t("titleThanks")}
						</Typography>
						<Typography className="mt-1 font-averta font-light" size="xl">
							{t("ourCats")}
						</Typography>
						<CatLookAtFishImage className="m-auto mt-4" />
					</div>
				)}
				<Button
					className={cn("mt-6 w-full justify-center p-1.5 px-7 text-lg font-bold text-white", {
						"justify-between": isFeedbackSubmitted,
					})}
					disabled={isSendingFeedback}
					type="submit"
					variant="outline"
				>
					{isSendingFeedback ? <Loader className="m-0" /> : null}
					{isFeedbackSubmitted ? t("form.buttons.close") : t("form.buttons.send")}
					{isFeedbackSubmitted ? <span className="ml-2 text-green-800">{timerCount}</span> : null}
				</Button>
			</form>
		</div>
	);
};
