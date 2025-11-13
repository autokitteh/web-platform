import React, { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import html2canvas from "html2canvas-pro";
import { AnimatePresence, motion } from "motion/react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { FeedbackService } from "@services/feedback.service";
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
		try {
			setIsSendingFeedback(true);

			const feedbackPayload = {
				url: window.location.href,
				dateTime: Date.now().toString(),
				name: anonymous ? "anonymous" : (user?.name ?? ""),
				email: anonymous ? "anonymous@anonymous.com" : (user?.email ?? ""),
				message: data.message,
				screenshot,
			};

			const { error } = await FeedbackService.sendFeedback(feedbackPayload);

			if (error) {
				addToast({
					message: tErrors("errorSendingFeedback"),
					type: "error",
				});
				LoggerService.error(
					namespaces.feedbackForm,
					tErrors("errorSendingFeedbackExtended", { error: JSON.stringify(error) }),
					true
				);
				return;
			}

			setIsFeedbackSubmitted(true);
			setTimeout(onClose, 4000);
		} catch (error) {
			addToast({
				message: tErrors("errorSendingFeedback"),
				type: "error",
			});
			LoggerService.error(
				namespaces.feedbackForm,
				tErrors("errorSendingFeedbackExtended", { error: JSON.stringify(error) }),
				true
			);
		} finally {
			setIsSendingFeedback(false);
		}
	};

	const takeScreenshot = async () => {
		setIsLoadingScreenshot(true);
		try {
			const screenshotCanvas = await html2canvas(document.body, {
				scale: 0.75,
				useCORS: true,
				allowTaint: true,
				backgroundColor: "#ffffff",
			});

			const tempCanvas = document.createElement("canvas");
			const maxWidth = 1024;
			const maxHeight = 768;
			const scale = Math.min(maxWidth / screenshotCanvas.width, maxHeight / screenshotCanvas.height, 1);

			tempCanvas.width = Math.floor(screenshotCanvas.width * scale);
			tempCanvas.height = Math.floor(screenshotCanvas.height * scale);

			const ctx = tempCanvas.getContext("2d");
			if (ctx) {
				ctx.drawImage(screenshotCanvas, 0, 0, tempCanvas.width, tempCanvas.height);
			}

			const screenshotData = tempCanvas.toDataURL("image/jpeg", 0.6);
			setScreenshot(screenshotData);
		} catch (error) {
			LoggerService.error(namespaces.feedbackForm, `Failed to capture screenshot: ${error}`);
			addToast({
				message: tErrors("errorCapturingScreenshot"),
				type: "error",
			});
		} finally {
			setIsLoadingScreenshot(false);
		}
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
					className={cn("z-[500] w-96 rounded-t-3xl border border-gray-750 bg-gray-1100 p-6", className)}
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
								<span className={cn({ "text-error-200": messageLength > 200 })}>
									{messageLength} / 200
								</span>
							</div>
							<div className="min-h-6">
								{errors.message ? <ErrorMessage>{errors.message.message}</ErrorMessage> : null}
							</div>
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
