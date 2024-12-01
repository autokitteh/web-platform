import React from "react";

import * as Sentry from "@sentry/react";
import html2canvas from "html2canvas-pro";
import { useForm } from "react-hook-form";

import { ModalName } from "@enums/components";
import { cn } from "@src/utilities";

import { Button, ErrorMessage, Input } from "@components/atoms";
import { Modal } from "@components/molecules";

export const UserFeedbackModal = () => {
	const {
		formState: { errors },
		handleSubmit,
		register,
	} = useForm<{ comments: string; email: string; name: string }>({
		mode: "onChange",
		defaultValues: {
			name: "",
			email: "",
			comments: "",
		},
	});

	const [shown, setShown] = React.useState(true);

	const onSubmit = async (data: { comments: string; email: string; name: string }) => {
		const { comments, email, name } = data;
		const sentryId = Sentry.captureMessage("Message that needs user feedback");

		const userFeedback = {
			event_id: sentryId,
			name,
			email,
			message: comments,
		};

		Sentry.captureFeedback(userFeedback);
	};

	const takeScreenshot = async () => {
		const screenshotSmall = await html2canvas(document.body);
		screenshotSmall.style.width = "100%";
		screenshotSmall.style.height = "100%";
		document.getElementById("screenshot")!.appendChild(screenshotSmall);
	};

	return (
		<Modal className="w-1/2 min-w-550 bg-black p-5" hideCloseButton name={ModalName.userFeedback}>
			<button
				className="text-white"
				onClick={() => {
					takeScreenshot();

					setShown(true);
				}}
			>
				Add screenshot
			</button>
			<div className={cn({ hidden: !shown })}>
				<div id="screenshot" />
			</div>

			<form className="mb-8" onSubmit={handleSubmit(onSubmit)}>
				<Input
					label="Name"
					placeholder="Enter your name"
					{...register("name", {
						required: "Name is required",
					})}
					isError={!!errors.name}
				/>
				{errors.name ? <ErrorMessage className="relative mt-0.5">{errors.name.message}</ErrorMessage> : null}

				<Input
					className="mt-4"
					label="Email"
					placeholder="Enter your email"
					{...register("email", {
						required: "Email is required",
						pattern: {
							value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
							message: "Invalid email address",
						},
					})}
					isError={!!errors.email}
				/>
				{errors.email ? <ErrorMessage className="relative mt-0.5">{errors.email.message}</ErrorMessage> : null}

				<Input
					className="mt-4"
					label="comments"
					placeholder="Enter your comments"
					{...register("comments", {
						required: "Comments are required",
					})}
					isError={!!errors.comments}
				/>
				{errors.comments ? (
					<ErrorMessage className="relative mt-0.5">{errors.comments.message}</ErrorMessage>
				) : null}

				<Button className="mt-4 bg-gray-1100 px-4 py-3 font-semibold" type="submit" variant="filled">
					Submit Feedback
				</Button>
			</form>
		</Modal>
	);
};
