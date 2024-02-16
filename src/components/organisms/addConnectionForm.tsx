import React from "react";
import { TestS } from "@assets/image";
import { Select, Input, Button, ErrorMessage } from "@components/atoms";
import { optionsSelectApp } from "@constants/lists";
import { zodResolver } from "@hookform/resolvers/zod";
import { newConnectionSchema } from "@validations";
import { useForm, Controller } from "react-hook-form";

export const AddConnectionForm = () => {
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
		control,
	} = useForm({
		resolver: zodResolver(newConnectionSchema),
	});

	const onSubmit = () => {};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<div className="flex items-start gap-10">
				<div className="grid gap-6 w-full">
					<div className="relative">
						<Controller
							control={control}
							name="connectionType"
							render={({ field }) => (
								<Select
									{...field}
									isError={!!errors.connectionType}
									onChange={(selected) => field.onChange(selected)}
									options={optionsSelectApp}
									placeholder="Select app"
									value={field.value}
								/>
							)}
						/>
						<ErrorMessage>{errors.connectionType?.message as string}</ErrorMessage>
					</div>
					<div className="relative">
						<Input {...register("userName")} isError={!!errors.userName} placeholder="User Name" />
						<ErrorMessage>{errors.userName?.message as string}</ErrorMessage>
					</div>
					<div className="relative">
						<Input {...register("password")} isError={!!errors.password} placeholder="Password" />
						<ErrorMessage>{errors.password?.message as string}</ErrorMessage>
					</div>
					<div className="relative">
						<Input
							{...register("connectionName")}
							isError={!!errors.connectionName}
							placeholder="Name new connection"
						/>
						<ErrorMessage>{errors.connectionName?.message as string}</ErrorMessage>
					</div>
				</div>

				<Button
					className="text-white border-white w-auto whitespace-nowrap hover:bg-black-900 px-3"
					disabled={!isValid}
					type="submit"
					variant="outline"
				>
					<TestS className="w-5 h-4 transition fill-white" /> Test Connection
				</Button>
			</div>
		</form>
	);
};
