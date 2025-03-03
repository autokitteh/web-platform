import React, { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Sentry from "@sentry/react";
import html2canvas from "html2canvas-pro";
import { AnimatePresence, motion } from "motion/react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { LoggerService } from "@services/logger.service";
import { namespaces } from "@src/constants";
import { UserFeedbackFormProps } from "@src/interfaces/components";
import { useToastStore, useOrganizationStore } from "@src/store";
import { cn } from "@src/utilities";
import { userFeedbackSchema } from "@validations";

import { Button, Checkbox, ErrorMessage, IconButton, Input, Loader, Textarea, Typography } from "@components/atoms";
import { ImageMotion } from "@components/molecules";

import { Close, TrashIcon } from "@assets/image/icons";

export const UserFeedbackForm = ({ className, isOpen, onClose }: UserFeedbackFormProps) => {
	const { t } = useTranslation("global", { keyPrefix: "userFeedback" });
	const { t: tErrors } = useTranslation("errors");
	const addToast = useToastStore((state) => state.addToast);
	const { user } = useOrganizationStore();
	const [isSendingFeedback, setIsSendingFeedback] = useState(false);
	const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);
	const [anonymous, setAnonymous] = useState(false);
	const [isLoadingScreenshot, setIsLoadingScreenshot] = useState(false);
	const [screenshot, setScreenshot] = useState<string | null>();
	const [messageLength, setMessageLength] = useState(0);

	const {
		formState: { errors },
		handleSubmit,
		register,
		reset,
	} = useForm({
		mode: "onBlur",
		defaultValues: {
			message: "",
		},
		resolver: zodResolver(userFeedbackSchema),
	});

	const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setMessageLength(e.target.value.length);
	};

	const onSubmit = async (data: { message: string }) => {
		const { message } = data;
		const userName = anonymous ? "" : user?.name;
		const userEmail = anonymous ? "" : user?.email;
		try {
			setIsSendingFeedback(true);

			const attachment = screenshot ? await (await fetch(screenshot)).blob() : null;
			const sentryId = Sentry.captureMessage("User Feedback");
			const userFeedback = {
				event_id: sentryId,
				name: userName,
				email: userEmail,
				message,
			};

			if (attachment) {
				const dataScreen = new Uint8Array(await attachment.arrayBuffer());
				Sentry.getCurrentScope().addAttachment({
					data: dataScreen,
					filename: "screenshot.jpg",
					contentType: "image/jpg",
				});
			}

			Sentry.captureFeedback(userFeedback);
			setIsFeedbackSubmitted(true);
			setTimeout(onClose, 4000);
		} catch (error) {
			Sentry.captureException({
				error,
				name: userName,
				email: userEmail,
				message,
			});
			addToast({
				message: tErrors("errorSendingFeedback"),
				type: "error",
			});
			LoggerService.error(namespaces.feedbackForm, tErrors("errorSendingFeedbackExtended", { error }));
		} finally {
			setIsSendingFeedback(false);
		}
	};

	const takeScreenshot = async () => {
		setIsLoadingScreenshot(true);
		const screenshotCanvas = await html2canvas(document.body);
		const screenshotData = screenshotCanvas.toDataURL("image/jpg");
		setScreenshot(screenshotData);
		setIsLoadingScreenshot(false);
	};

	useEffect(() => {
		if (!isOpen) {
			reset();
			setIsFeedbackSubmitted(false);
			setAnonymous(false);
			setMessageLength(0);
			setScreenshot(null);
		}
	}, [isOpen, reset]);

	return (
		<AnimatePresence>
			{isOpen ? (
				<motion.div
					animate={{ y: 0 }}
					className={cn("w-96 rounded-t-3xl border border-gray-750 bg-gray-1100 p-6 z-[500]", className)}
					data-html2canvas-ignore
					exit={{ y: +500 }}
					initial={{ y: +500 }}
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
					<form className="mt-5 flex flex-col justify-between" onSubmit={handleSubmit(onSubmit)}>
						{anonymous ? null : (
							<div className="mb-6">
								<Input
									disabled
									label={t("form.name")}
									placeholder={t("form.placeholder.name")}
									type="text"
									value={user?.name}
								/>
								<Input
									className="mt-6"
									disabled
									label={t("form.email")}
									placeholder={t("form.placeholder.email")}
									type="email"
									value={user?.email}
								/>
							</div>
						)}

						<div>
							<Textarea
								rows={5}
								{...register("message", {
									onChange: handleMessageChange,
									maxLength: 200,
								})}
								disabled={isFeedbackSubmitted || isSendingFeedback}
								isError={!!errors.message}
								isRequired
								label={t("form.message")}
								placeholder={t("form.placeholder.message")}
							/>
							<div className="mt-1 flex justify-end text-sm text-gray-600">
								<span className={messageLength > 200 ? "text-error-200" : ""}>
									{messageLength} / 200
								</span>
							</div>
							{errors.message ? (
								<ErrorMessage className="relative">{errors.message.message}</ErrorMessage>
							) : null}
						</div>
						<Checkbox
							checked={anonymous}
							className="mt-1 justify-start"
							isLoading={false}
							label={t("sendAnonymously")}
							labelClassName="text-base"
							onChange={() => setAnonymous(!anonymous)}
						/>
						{screenshot ? (
							<div className="mt-4 flex items-end gap-4">
								<div className="h-32 w-full overflow-hidden rounded-md border-2 border-gray-950">
									<ImageMotion alt={t("altScrenshot")} src={screenshot} />
								</div>
								<IconButton
									className="items-center gap-1 font-light"
									onClick={() => setScreenshot(null)}
								>
									<TrashIcon className="size-4 stroke-white" />
									<span className="mt-0.5">{t("form.buttons.remove")}</span>
								</IconButton>
							</div>
						) : (
							<Button
								className="mt-5 justify-center"
								disabled={isLoadingScreenshot}
								onClick={takeScreenshot}
								variant="filled"
							>
								{isLoadingScreenshot ? <Loader className="m-0" size="sm" /> : null}
								{t("form.buttons.takeScreenshot")}
							</Button>
						)}

						{isFeedbackSubmitted ? (
							<Typography className="mt-5 text-center font-averta font-bold" size="xl">
								{t("thankYou")}
							</Typography>
						) : (
							<Button
								className={cn("mt-5 w-full justify-center p-1.5 px-7 text-lg font-bold text-white", {
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
