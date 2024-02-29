import React, { useState } from "react";
import { TestS } from "@assets/image";
import { ArrowLeft } from "@assets/image/icons";
import { Select, Input, Textarea, Button, ErrorMessage, IconButton, Toast } from "@components/atoms";
import { optionsSelectApp } from "@constants/lists";
import { zodResolver } from "@hookform/resolvers/zod";
import { ISelectAppChangeForm } from "@interfaces/components";
import { newConnectionSchema } from "@validations";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export const AddConnectionForm = () => {
	const [selectedApp, setSelectedApp] = useState<{ [key: string]: string }>({});
	const [isOpenToast, setIsOpenToast] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	const {
		register,
		handleSubmit,
		formState: { errors },
		control,
		reset,
	} = useForm({
		resolver: zodResolver(newConnectionSchema),
	});

	const handleSelectChange = ({ name, value }: ISelectAppChangeForm) => {
		setSelectedApp((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const handleCloseToast = () => setIsOpenToast(false);

	const onSubmit = () => {
		setIsLoading(true);
		setIsOpenToast(true);
		setTimeout(() => {
			setIsLoading(false);
			navigate(-1);
			reset();
		}, 3000);
	};

	return (
		<>
			<div className="flex justify-between mb-11">
				<div className="flex items-center gap-1">
					<IconButton className="hover:bg-black p-0 w-8 h-8" onClick={() => navigate(-1)}>
						<ArrowLeft />
					</IconButton>
					<p className="text-gray-300 text-base">Add new connection</p>
				</div>
				<div className="flex items-center gap-6">
					<Button className="text-gray-300 hover:text-white p-0 font-semibold" onClick={() => navigate(-1)}>
						Cancel
					</Button>
					<Button className="px-4 py-2 font-semibold text-white border-white hover:bg-black" disabled variant="outline">
						Save
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
										handleSelectChange({ name: "connectionApp", value: selected[0]?.value || "" });
									}}
									options={optionsSelectApp}
									placeholder="Select app"
									value={field.value}
								/>
							)}
						/>
						<ErrorMessage>{errors.connectionApp?.message as string}</ErrorMessage>
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
					{selectedApp.connectionApp === "temporal" ? (
						<div className="relative">
							<Textarea {...register("specificField")} isError={!!errors.specificField} rows={4} />
							<ErrorMessage>{errors.specificField?.message as string}</ErrorMessage>
						</div>
					) : null}
				</div>

				<Button
					className="text-white border-white w-auto whitespace-nowrap hover:bg-black px-3"
					disabled={isLoading}
					type="submit"
					variant="outline"
				>
					<TestS className="w-5 h-4 transition fill-white" /> {isLoading ? "Loading..." : "Test Connection"}
				</Button>
			</form>
			<Toast className="border-green-accent" duration={10} isOpen={isOpenToast} onClose={handleCloseToast}>
				<div className="flex">
					<h5 className="font-semibold">JeffOnSlack</h5>
					<h5 className="border-l-2 border-gray-400 ml-2 pl-2 font-light">Slack</h5>
				</div>
				<p className="mt-1 text-xs">Success</p>
			</Toast>
		</>
	);
};
