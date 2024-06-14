import React, { useState } from "react";
import { FloppyDiskIcon } from "@assets/image/icons";
import { Button, ErrorMessage, Input, Spinner } from "@components/atoms";
import { namespaces } from "@constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoggerService } from "@services";
import { HttpService } from "@services";
import { useToastStore } from "@store";
import { chatGPTIntegrationSchema } from "@validations";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

export const ChatGPTIntegrationForm = () => {
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("integrations");

	const [isLoading, setIsLoading] = useState(false);
	const addToast = useToastStore((state) => state.addToast);

	const {
		handleSubmit,
		formState: { errors },
		register,
		getValues,
	} = useForm({
		resolver: zodResolver(chatGPTIntegrationSchema),
		defaultValues: {
			key: "",
		},
	});

	const onSubmit = async () => {
		const { key } = getValues();

		setIsLoading(true);
		try {
			const { data } = await HttpService.post("/chatgpt/save", { key });
			if (!data.url) {
				addToast({
					id: Date.now().toString(),
					message: tErrors("errorCreatingNewConnection"),
					title: "Error",
					type: "error",
				});
				LoggerService.error(
					namespaces.connectionService,
					`${tErrors("errorCreatingNewConnectionExtended", { error: tErrors("noDataReturnedFromServer") })}`
				);
				return;
			}
		} catch (error) {
			addToast({
				id: Date.now().toString(),
				message: tErrors("errorCreatingNewConnection"),
				title: "Error",
				type: "error",
			});
			LoggerService.error(
				namespaces.connectionService,
				`${tErrors("errorCreatingNewConnectionExtended", { error: (error as Error).message })}`
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form className="flex flex-col w-full gap-6" onSubmit={handleSubmit(onSubmit)}>
			<div className="relative">
				<Input
					{...register("key")}
					aria-label={t("chatGPT.placeholders.apiKey")}
					isError={!!errors.key}
					isRequired
					placeholder={t("chatGPT.placeholders.apiKey")}
				/>
				<ErrorMessage>{errors.key?.message as string}</ErrorMessage>
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
		</form>
	);
};
