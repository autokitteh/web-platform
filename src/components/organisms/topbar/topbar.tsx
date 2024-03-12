import React, { useEffect, useState } from "react";
import { FullScreen, More } from "@assets/image";
import { Button, IconButton, IconSvg } from "@components/atoms";
import { DropdownButton } from "@components/molecules";
import { topbarItems } from "@constants";
import { ProjectsService } from "@services";
import { useUiGlobalStore, useMenuStore } from "@store";
import { Project } from "@type/models";
import { cn } from "@utilities";

export const Topbar = () => {
	const { newProjectId } = useMenuStore();
	const { isFullScreen, toggleFullScreen } = useUiGlobalStore();
	const [project, setProject] = useState<Project>({
		name: "Slack Monitor",
		projectId: "Version 454462",
	});

	const styleIconSreen = cn({ "border-transparent bg-black": isFullScreen });

	useEffect(() => {
		if (!newProjectId) return;
		const fetchProject = async () => {
			const { data } = await ProjectsService.get(newProjectId);
			data && setProject(data);
		};
		fetchProject();
	}, [newProjectId]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>) => {
		if (e.target instanceof HTMLInputElement) {
			setProject({ ...project, name: e.target.value });
		}

		if (e.type === "blur") return;

		if (e.type === "keydown" && (e as React.KeyboardEvent<HTMLInputElement>).key === "Enter") {
			(e.target as HTMLInputElement).blur();
		}
	};

	return (
		<div className="flex justify-between items-center bg-gray-700 gap-5 pl-7 pr-3.5 py-3 rounded-b-xl">
			<div className="flex items-end gap-3">
				<input
					className="font-semibold p-0 text-2xl leading-6 bg-transparent"
					onBlur={handleInputChange}
					onChange={handleInputChange}
					onKeyDown={handleInputChange}
					title="Rename"
					type="text"
					value={project.name}
				/>

				<span className="font-semibold text-gray-300 leading-none">{project.projectId}</span>
			</div>
			<div className="flex items-stretch gap-3">
				{topbarItems.map(({ id, name, href, icon, disabled }) => (
					<Button
						className="px-4 py-2 font-semibold text-white"
						disabled={disabled}
						href={href}
						key={id}
						variant="outline"
					>
						<IconSvg className="max-w-5" disabled={disabled} src={icon} />
						{name}
					</Button>
				))}
				<DropdownButton
					className="font-semibold text-white"
					contentMenu={
						<div className="flex flex-col gap-2">
							{topbarItems.map(({ id, name, href, icon, disabled }) => (
								<Button
									className="px-4 py-1.5 font-semibold text-white"
									disabled={disabled}
									href={href}
									key={id}
									variant="outline"
								>
									<IconSvg className="w-4" disabled={disabled} src={icon} />
									{name}
								</Button>
							))}
						</div>
					}
				>
					<Button className="h-full text-white px-4" variant="outline">
						<More />
						More
					</Button>
				</DropdownButton>
				<IconButton className={styleIconSreen} onClick={toggleFullScreen} variant="outline">
					<FullScreen />
				</IconButton>
			</div>
		</div>
	);
};
