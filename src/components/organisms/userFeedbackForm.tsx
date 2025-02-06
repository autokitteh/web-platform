import React, { useEffect, useRef, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Sentry from "@sentry/react";
import { AnimatePresence, motion } from "motion/react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useScreenshot } from "use-react-screenshot";

import { LoggerService } from "@services/logger.service";
import { namespaces } from "@src/constants";
import { UserFeedbackFormProps } from "@src/interfaces/components";
import { useToastStore, useOrganizationStore } from "@src/store";
import { cn } from "@src/utilities";
import { userFeedbackSchema } from "@validations";

import { Button, Checkbox, ErrorMessage, IconButton, Input, Loader, Textarea, Typography } from "@components/atoms";

import { Close } from "@assets/image/icons";

export const UserFeedbackForm = ({ className, isOpen, onClose }: UserFeedbackFormProps) => {
	const { t } = useTranslation("global", { keyPrefix: "userFeedback" });
	const { t: tErrors } = useTranslation("errors");
	const addToast = useToastStore((state) => state.addToast);
	const { user } = useOrganizationStore();
	const [isSendingFeedback, setIsSendingFeedback] = useState(false);
	const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);
	const [anonymous, setAnonymous] = useState(false);
	const [image, takeScreenShot] = useScreenshot({
		type: "image/png",
		quality: 1.0,
	});
	const ref = useRef(null);

	const {
		formState: { errors },
		handleSubmit,
		register,
		reset,
	} = useForm({
		mode: "onChange",
		defaultValues: {
			message: "",
		},
		resolver: zodResolver(userFeedbackSchema),
	});

	const getImage = async () => {
		const image = await takeScreenShot(document.body);
		const blob = await new Promise<Blob>((resolve) => {
			const img = new Image();
			img.src = image;
			img.onload = () => {
				const canvas = document.createElement("canvas");
				canvas.width = img.width;
				canvas.height = img.height;
				const ctx = canvas.getContext("2d");
				if (!ctx) return resolve(new Blob([]));
				ctx.drawImage(img, 0, 0);
				canvas.toBlob((blob) => {
					if (blob) resolve(blob);
					else resolve(new Blob([]));
				}, "image/png");
			};
		});
		if (blob) {
			const data = new Uint8Array(await blob.arrayBuffer());
			const attachment = {
				data,
				filename: "screenshot.png",
				contentType: "application/png",
			};
			return attachment;
		}
		return undefined;
	};

	const onSubmit = async (data: { message: string }) => {
		const { message } = data;
		const userName = anonymous ? "" : user?.name;
		const userEmail = anonymous ? "" : user?.email;

		try {
			setIsSendingFeedback(true);

			const sentryId = Sentry.captureMessage("User Feedback");
			const userFeedback = {
				event_id: sentryId,
				name: userName,
				email: userEmail,
				message,
			};

			const attachment = await getImage();
			if (attachment) {
				Sentry.getCurrentScope().addAttachment(attachment);
			}

			Sentry.captureFeedback(userFeedback);

			setIsFeedbackSubmitted(true);

			setTimeout(() => {
				onClose();
			}, 4000);
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

	useEffect(() => {
		if (!isOpen) {
			reset();
			setIsFeedbackSubmitted(false);
			setAnonymous(false);
		}
	}, [isOpen, reset]);

	return (
		<AnimatePresence>
			{isOpen ? (
				<motion.div
					animate={{ x: 0 }}
					className={cn(
						"min-h-550 w-96 rounded-t-3xl border border-gray-750 bg-gray-1100 p-6 z-[500]",
						className
					)}
					exit={{ x: -500 }}
					initial={{ x: -500 }}
					transition={{ type: "spring", stiffness: 100, damping: 15 }}
				>
					<div ref={ref}>
						<img alt="Screenshot" src={image} width={200} />

						<button className="text-white" onClick={getImage}>
							Add screenshot
						</button>
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
							<Input
								disabled
								label={t("form.name")}
								placeholder={t("form.placeholder.name")}
								type={anonymous ? "password" : "text"}
								value={user?.name}
							/>
							<Input
								className="mt-6"
								disabled
								label={t("form.email")}
								placeholder={t("form.placeholder.email")}
								type={anonymous ? "password" : "email"}
								value={user?.email}
							/>
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

							{isFeedbackSubmitted ? (
								<Typography className="mt-5 text-center font-averta font-bold" size="xl">
									{t("thankYou")}
								</Typography>
							) : (
								<Button
									className={cn(
										"mt-5 w-full justify-center p-1.5 px-7 text-lg font-bold text-white",
										{
											"justify-between": isFeedbackSubmitted,
										}
									)}
									disabled={isSendingFeedback}
									type="submit"
									variant="outline"
								>
									{isSendingFeedback ? <Loader className="m-0" /> : null}
									{t("form.buttons.send")}
								</Button>
							)}
						</form>
					</div>
				</motion.div>
			) : null}
		</AnimatePresence>
	);
};
