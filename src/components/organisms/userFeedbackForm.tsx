import React, { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Sentry from "@sentry/react";
import { AnimatePresence, motion } from "motion/react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { LoggerService } from "@services/logger.service";
import { namespaces } from "@src/constants";
import { UserFeedbackFormProps } from "@src/interfaces/components";
import { useToastStore } from "@src/store";
import { cn } from "@src/utilities";
import { userFeedbackSchema } from "@validations";

import { Button, ErrorMessage, IconButton, Input, Loader, Textarea, Typography } from "@components/atoms";

import { Close } from "@assets/image/icons";

export const UserFeedbackForm = ({ className, isOpen, onClose }: UserFeedbackFormProps) => {
	const { t } = useTranslation("global", { keyPrefix: "userFeedback" });
	const { t: tErrors } = useTranslation("errors");
	const addToast = useToastStore((state) => state.addToast);
	const [isSendingFeedback, setIsSendingFeedback] = useState(false);
	const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);

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
			message: "",
		},
		resolver: zodResolver(userFeedbackSchema),
	});

	const onSubmit = async (data: { email: string; message: string; name: string }) => {
		const { email, message, name } = data;
		try {
			setIsSendingFeedback(true);
			const sentryId = Sentry.captureMessage("User Feedback");
			const userFeedback = { event_id: sentryId, name, email, message };

			Sentry.captureFeedback(userFeedback);

			setIsFeedbackSubmitted(true);

			setTimeout(() => {
				onClose();
			}, 4000);
		} catch (error) {
			Sentry.captureException({ error, email, name, message });
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
		if (!isOpen) {
			setIsFeedbackSubmitted(false);
			reset();
		}
	}, [isOpen, reset]);

	return (
		<AnimatePresence>
			{isOpen ? (
				<motion.div
					animate={{ x: 0 }}
					className={cn(
						"h-500 w-96 rounded-t-3xl border border-gray-750 bg-gray-1100 p-6 z-[500]",
						className
					)}
					exit={{ x: -500 }}
					initial={{ x: -500 }}
					transition={{ type: "spring", stiffness: 100, damping: 15 }}
				>
					<div className="flex items-center justify-between gap-1">
						<Typography className="font-averta font-bold" size="2xl">
							{t("title")}
						</Typography>
						<IconButton
							className="group ml-auto h-default-icon w-default-icon bg-gray-1250 p-0"
							onClick={onClose}
						>
							<Close className="size-3 fill-gray-750 transition group-hover:fill-white" />
						</IconButton>
					</div>
					<form className="mt-5 flex h-350 flex-col justify-between" onSubmit={handleSubmit(onSubmit)}>
						<div>
							<Input
								label={t("form.name")}
								placeholder={t("form.placeholder.name")}
								{...register("name")}
								disabled={isFeedbackSubmitted || isSendingFeedback}
								isError={!!errors.name}
								isRequired
							/>
							{errors.name ? <ErrorMessage>{errors.name.message}</ErrorMessage> : null}
						</div>
						<div>
							<Input
								className="mt-6"
								disabled={isFeedbackSubmitted || isSendingFeedback}
								isRequired
								label={t("form.email")}
								placeholder={t("form.placeholder.email")}
								{...register("email")}
								isError={!!errors.email}
							/>
							{errors.email ? <ErrorMessage>{errors.email.message}</ErrorMessage> : null}
						</div>
						<div>
							<Textarea
								rows={5}
								{...register("message")}
								className="mt-6"
								disabled={isFeedbackSubmitted || isSendingFeedback}
								isError={!!errors.message}
								isRequired
								label={t("form.message")}
								placeholder={t("form.placeholder.message")}
							/>
							{errors.message ? <ErrorMessage>{errors.message.message}</ErrorMessage> : null}
						</div>

						{isFeedbackSubmitted ? (
							<Typography className="mt-6 text-center font-averta font-bold" size="xl">
								{t("thankYou")}
							</Typography>
						) : (
							<Button
								className={cn("mt-6 w-full justify-center p-1.5 px-7 text-lg font-bold text-white", {
									"justify-between": isFeedbackSubmitted,
								})}
								disabled={isSendingFeedback}
								type="submit"
								variant="outline"
							>
								{isSendingFeedback ? <Loader className="m-0" /> : null}
								{t("form.buttons.send")}
							</Button>
						)}
					</form>
				</motion.div>
			) : null}
		</AnimatePresence>
	);
};
