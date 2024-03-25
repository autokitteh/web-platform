import React, { useState } from "react";
import { ArrowLeft } from "@assets/image/icons";
import { Select, Button, ErrorMessage, IconButton, Toast } from "@components/atoms";
import { optionsSelectApp } from "@constants/lists";
import { zodResolver } from "@hookform/resolvers/zod";
import { newConnectionSchema } from "@validations";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export const AddTriggerForm = () => {
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	const {
		handleSubmit,
		formState: { errors },
		control,
	} = useForm({
		resolver: zodResolver(newConnectionSchema),
	});

	const onSubmit = () => {
		setIsLoading(true);
		setIsLoading(false);
		navigate(-1);
	};

	return (
		<div className="min-w-550">
			<div className="flex justify-between mb-11">
				<div className="flex items-center gap-1">
					<IconButton className="hover:bg-black p-0 w-8 h-8" onClick={() => navigate(-1)}>
						<ArrowLeft />
					</IconButton>
					<p className="text-gray-300 text-base">Add new trigger</p>
				</div>
				<div className="flex items-center gap-6">
					<Button className="text-gray-300 hover:text-white p-0 font-semibold" onClick={() => navigate(-1)}>
						Cancel
					</Button>
					<Button className="px-4 py-2 font-semibold text-white border-white hover:bg-black" variant="outline">
						{isLoading ? "Loading..." : "Save"}
					</Button>
				</div>
			</div>
			<form className="flex items-start gap-10" onSubmit={handleSubmit(onSubmit)}>
				<div className="flex flex-col gap-6 w-full">
					<div className="relative">
						<Controller
							control={control}
							name="connectionApp"
							render={({ field }) => (
								<Select
									{...field}
									isError={!!errors.connectionApp}
									onChange={(selected) => {
										field.onChange(selected);
									}}
									options={optionsSelectApp}
									placeholder="Select connection"
									value={field.value}
								/>
							)}
						/>
						<ErrorMessage>{errors.connectionApp?.message as string}</ErrorMessage>
					</div>
					<div className="relative">
						<Controller
							control={control}
							name="fileApp"
							render={({ field }) => (
								<Select
									{...field}
									isError={!!errors.connectionApp}
									onChange={(selected) => {
										field.onChange(selected);
									}}
									options={optionsSelectApp}
									placeholder="Select file"
									value={field.value}
								/>
							)}
						/>
						<ErrorMessage>{errors.connectionApp?.message as string}</ErrorMessage>
					</div>
				</div>
			</form>
			<Toast
				className="border-error"
				duration={5}
				isOpen={toast.isOpen}
				onClose={() => setToast({ ...toast, isOpen: false })}
			>
				<h5 className="font-semibold text-error">Error</h5>
				<p className="mt-1 text-xs">{toast.message}</p>
			</Toast>
		</div>
	);
};
