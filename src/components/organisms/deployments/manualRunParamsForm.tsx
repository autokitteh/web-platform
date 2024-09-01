import React from "react";

import { Controller, FieldErrors, FieldValues, useFieldArray, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { ManualFormParamsErrors } from "@src/types/components";

import { Button, ErrorMessage, IconButton, Input } from "@components/atoms";

import { PlusCircle } from "@assets/image";
import { InfoIcon, TrashIcon } from "@assets/image/icons";

export const ManualRunParamsForm = () => {
	const { t } = useTranslation("deployments", { keyPrefix: "history.manualRun" });
	const { control, formState, trigger } = useFormContext();
	const { append, fields, remove } = useFieldArray({
		control,
		name: "params",
	});

	const handleAddParam = async () => {
		const isValid = await trigger("params");
		if (!isValid) return;
		append({ key: "", value: "" });
	};

	const errors = formState.errors?.params as FieldErrors<FieldValues> & ManualFormParamsErrors;

	return (
		<form className="mt-5">
			<div className="flex items-center gap-1 text-base text-gray-500">
				{t("titleParams")}

				<div className="cursor-pointer" title={t("titleParams")}>
					<InfoIcon className="fill-white" />
				</div>
			</div>

			{fields.map((field, index) => (
				<div className="mb-3 flex items-end gap-2" key={field.id}>
					<Controller
						control={control}
						name={`params.${index}.key`}
						render={({ field }) => (
							<div className="w-1/2">
								<Input
									{...field}
									isError={!!errors?.params?.[index]?.key}
									isRequired
									label={t("placeholders.key")}
									onChange={async (event) => {
										field.onChange(event);
										await trigger("params");
									}}
								/>

								{errors?.params?.[index]?.key ? (
									<ErrorMessage>{errors.params[index]?.key?.message}</ErrorMessage>
								) : null}
							</div>
						)}
						rules={{ required: t("keyRequired") }}
					/>

					<Controller
						control={control}
						name={`params.${index}.value`}
						render={({ field }) => (
							<div className="w-1/2">
								<Input
									{...field}
									isError={!!errors?.params?.[index]?.value}
									isRequired
									label={t("placeholders.value")}
									onChange={async (event) => {
										field.onChange(event);
										await trigger("params");
									}}
								/>

								{errors?.params?.[index]?.value ? (
									<ErrorMessage>{errors.params[index]?.value?.message}</ErrorMessage>
								) : null}
							</div>
						)}
						rules={{ required: t("valueRequired") }}
					/>

					<IconButton
						ariaLabel={t("ariaDeleteParam")}
						className="self-center bg-gray-1300 hover:bg-black"
						onClick={() => remove(index)}
					>
						<TrashIcon className="h-4 w-4 fill-white" />
					</IconButton>
				</div>
			))}

			<Button
				className="group ml-auto w-auto gap-1 p-0 font-semibold text-gray-500 hover:text-white"
				onClick={handleAddParam}
				type="button"
			>
				<PlusCircle className="h-5 w-5 stroke-gray-500 duration-300 group-hover:stroke-white" />

				{t("buttons.addNewParameter")}
			</Button>
		</form>
	);
};
