import React from "react";

import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { infoHttpBasicLinks } from "@constants/lists/connections";

import { Button, ErrorMessage, Input, Link, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const HttpBasicForm = ({ isLoading }: { isLoading: boolean }) => {
	const { t } = useTranslation("integrations");
	const {
		formState: { errors },
		register,
	} = useFormContext();

	return (
		<>
			<div className="relative">
				<Input
					{...register("username")}
					aria-label={t("http.placeholders.username")}
					isError={!!errors.username}
					isRequired
					placeholder={t("http.placeholders.username")}
				/>

				<ErrorMessage>{errors.username?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				<Input
					{...register("password")}
					aria-label={t("http.placeholders.password")}
					isError={!!errors.password}
					isRequired
					placeholder={t("http.placeholders.password")}
				/>

				<ErrorMessage>{errors.password?.message as string}</ErrorMessage>
			</div>
			<Button
				aria-label={t("buttons.saveConnection")}
				className="ml-auto w-fit border-white px-3 font-medium text-white hover:bg-black"
				disabled={isLoading}
				type="submit"
				variant="outline"
			>
				{isLoading ? <Spinner /> : <FloppyDiskIcon className="h-5 w-5 fill-white transition" />}

				{t("buttons.saveConnection")}
			</Button>
			<Accordion title={t("information")}>
				<div className="flex flex-col gap-2">
					{infoHttpBasicLinks.map(({ text, url }, index) => (
						<Link
							className="group inline-flex items-center gap-2.5 text-green-800"
							key={index}
							target="_blank"
							to={url}
						>
							{text}

							<ExternalLinkIcon className="h-3.5 w-3.5 fill-green-800 duration-200" />
						</Link>
					))}
				</div>
			</Accordion>
		</>
	);
};
