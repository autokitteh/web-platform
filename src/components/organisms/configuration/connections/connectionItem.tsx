import React from "react";

import { ConnectionItemDisplay } from "./connectionItemDisplay";
import { ProjectSettingsItemAction } from "@interfaces/components";
import { Integrations } from "@src/enums/components";
import { ConnectionStatusType } from "@src/types/models";
import { cn } from "@src/utilities";

import { Button, IconSvg } from "@components/atoms";
import { ConnectionTableStatus } from "@components/molecules";
import { PopoverContent, PopoverTrigger, PopoverWrapper } from "@components/molecules/popover";

import { TrashIcon } from "@assets/image/icons";

interface ConnectionItemProps {
	id: string;
	icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	name: string;
	statusInfoMessage?: string;
	connectionStatus: ConnectionStatusType;
	integration: (typeof Integrations)[keyof typeof Integrations];
	shouldShowTooltip: boolean;
	isOrgConnection?: boolean;
	actions: ProjectSettingsItemAction;
	ids: {
		actionsContainerId: string;
		configureButtonId: string;
		connectionContainerId: string;
		connectionDisplayId: string;
		deleteButtonId: string;
		showEventsButtonId?: string;
	};
	configureButtonIdForTour: string;
}

export const ConnectionItem = ({
	id,
	icon,
	name,
	statusInfoMessage,
	connectionStatus,
	integration,
	shouldShowTooltip,
	isOrgConnection = false,
	ids,
	actions,
	configureButtonIdForTour,
}: ConnectionItemProps) => {
	const configureButtonClass = cn("group my-0.5 mr-1 size-5 border-none p-0 hover:bg-transparent");
	const configureIconClass = cn("size-[1.1rem] fill-white group-hover:fill-green-800");

	const containerClass = cn(
		"relative flex flex-row items-center justify-between rounded-lg border border-gray-700 bg-transparent p-2 transition-colors"
	);

	const connectionContainerId = ids?.connectionContainerId;
	const connectionDisplayId = ids?.connectionDisplayId;

	const handleClick = () => {
		if (!actions) {
			return;
		}
		actions.configure.onClick(id);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (actions && (e.key === "Enter" || e.key === " ")) {
			e.preventDefault();
			actions.configure.onClick(id);
		}
	};

	return (
		<div
			className={containerClass}
			id={connectionContainerId}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			role="button"
			tabIndex={0}
		>
			<div className="ml-2.5 flex w-2/5 text-white sm:w-1/4 xl:w-1/3 2xl:w-[65%]" id={connectionDisplayId}>
				<ConnectionItemDisplay
					isOrgConnection={isOrgConnection}
					item={{ id, icon, name, integration, status: connectionStatus }}
				/>
			</div>

			<div className="flex-1" />

			{shouldShowTooltip ? (
				<PopoverWrapper interactionType="hover" placement="top">
					<PopoverTrigger>
						<div className="flex w-fit items-center gap-0">
							<ConnectionTableStatus status={connectionStatus} />
						</div>
					</PopoverTrigger>
					<PopoverContent className="h-6 max-w-md break-all border border-gray-700 bg-gray-900 p-1 text-xs text-white">
						{statusInfoMessage}
					</PopoverContent>
				</PopoverWrapper>
			) : (
				<ConnectionTableStatus status={connectionStatus} />
			)}

			{actions ? (
				<div className="relative z-10 flex items-center gap-1" id={ids?.actionsContainerId}>
					{actions.showEvents ? (
						<PopoverWrapper interactionType="hover" placement="top">
							<PopoverTrigger>
								<Button
									ariaLabel={actions.showEvents.ariaLabel}
									className="group mx-1 size-6 border-none p-1 hover:bg-transparent"
									disabled={connectionStatus !== "ok"}
									id={ids?.showEventsButtonId}
									onClick={(e) => {
										e.stopPropagation();
										actions.showEvents!.onClick(id);
									}}
									variant="outline"
								>
									<actions.showEvents.icon className="size-4 stroke-white stroke-[1.25] group-hover:stroke-green-800" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="h-6 border border-gray-700 bg-gray-900 p-1 text-xs text-white">
								{actions.showEvents.label}
							</PopoverContent>
						</PopoverWrapper>
					) : (
						<div className="flex w-6" />
					)}

					<PopoverWrapper interactionType="hover" placement="top">
						<PopoverTrigger>
							<Button
								ariaLabel={actions.configure.ariaLabel}
								className={configureButtonClass}
								data-test-id={ids?.configureButtonId}
								id={configureButtonIdForTour}
								onClick={(e) => {
									e.stopPropagation();
									actions.configure.onClick(id);
								}}
								title={actions.configure.ariaLabel}
								variant="outline"
							>
								<IconSvg className={configureIconClass} src={actions.configure.icon} />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="h-6 border border-gray-700 bg-gray-900 p-1 text-xs text-white">
							{actions.configure.label}
						</PopoverContent>
					</PopoverWrapper>

					<PopoverWrapper interactionType="hover" placement="top">
						<PopoverTrigger>
							<Button
								ariaLabel={actions.delete.ariaLabel}
								className="group border-none p-1 hover:bg-transparent"
								id={ids?.deleteButtonId}
								onClick={(e) => {
									e.stopPropagation();
									actions.delete.onClick(id);
								}}
								variant="outline"
							>
								<TrashIcon className="size-4 stroke-white stroke-[1.25] group-hover:stroke-error" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="h-6 border border-gray-700 bg-gray-900 p-1 text-xs text-white">
							{actions.delete.label}
						</PopoverContent>
					</PopoverWrapper>
				</div>
			) : null}
		</div>
	);
};
