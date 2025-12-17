import React, { useCallback, useEffect } from "react";

import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "react-router-dom";

import { EventListenerName } from "@src/enums";
import { DrawerName } from "@src/enums/components";
import { useEventListener } from "@src/hooks";
import { useGlobalConnectionsStore, useOrganizationStore } from "@src/store";
import { cn } from "@src/utilities";

import { Button, IconButton } from "@components/atoms";
import { Drawer } from "@components/molecules";
import { AddConnection } from "@components/organisms/configuration/connections/add";
import { EditConnection } from "@components/organisms/configuration/connections/edit";
import { GlobalConnectionsList } from "@components/organisms/globalConnections/list";

import { ArrowLeft, Close, PlusIcon } from "@assets/image/icons";

export const GlobalConnectionsDrawer = () => {
	const { t } = useTranslation("connections");
	const location = useLocation();
	const { projectId: projectIdUrlParam } = useParams();

	const { currentOrganization } = useOrganizationStore();
	const {
		fetchGlobalConnections,
		selectedGlobalConnectionId,
		setSelectedGlobalConnectionId,
		isDrawerOpen,
		openDrawer,
		closeDrawer,
		isDrawerEditMode,
		setDrawerEditMode,
		isDrawerAddMode,
		setDrawerAddMode,
	} = useGlobalConnectionsStore();

	useEffect(() => {
		if (currentOrganization?.id) {
			fetchGlobalConnections(currentOrganization.id);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentOrganization?.id]);

	useEventListener(EventListenerName.displayGlobalConnectionsDrawer, openDrawer);
	useEventListener(EventListenerName.hideGlobalConnectionsDrawer, closeDrawer);

	const handleBackToList = useCallback(() => {
		setSelectedGlobalConnectionId(undefined);
		setDrawerEditMode(false);
		setDrawerAddMode(false);
	}, [setSelectedGlobalConnectionId, setDrawerEditMode, setDrawerAddMode]);

	const handleConnectionSuccess = useCallback(() => {
		if (currentOrganization?.id) {
			fetchGlobalConnections(currentOrganization.id, true);
		}
		handleBackToList();
	}, [currentOrganization?.id, fetchGlobalConnections, handleBackToList]);

	const handleAddClick = () => setDrawerAddMode(true);

	useEffect(() => {
		const handleEscapeKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				if (isDrawerEditMode || isDrawerAddMode) {
					handleBackToList();
				} else {
					closeDrawer();
				}
			}
		};

		document.addEventListener("keydown", handleEscapeKey);

		return () => {
			document.removeEventListener("keydown", handleEscapeKey);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isDrawerEditMode, isDrawerAddMode]);

	if (!location.pathname.startsWith("/projects") || !projectIdUrlParam) {
		return null;
	}

	const headerClass = cn("mb-4 flex items-center justify-between border-b border-gray-750 pb-4");

	return (
		<Drawer
			bgClickable
			divId="global-connections-drawer"
			isForcedOpen={isDrawerOpen}
			name={DrawerName.globalConnections}
			onCloseCallback={closeDrawer}
			position="left"
			variant="dark"
			width={50}
		>
			<div className="flex h-full flex-col">
				<div className={headerClass}>
					<div className="flex items-center gap-2">
						{isDrawerEditMode || isDrawerAddMode ? (
							<Button
								ariaLabel={t("globalConnections.buttons.backToList")}
								className="mr-2"
								onClick={handleBackToList}
								variant="filledGray"
							>
								<ArrowLeft className="size-4 hover:stroke-green-800" />
							</Button>
						) : null}
						<h2 className="text-xl font-semibold text-white">
							{isDrawerEditMode
								? t("globalConnections.editTitle")
								: isDrawerAddMode
									? t("globalConnections.addTitle")
									: t("globalConnections.title")}
						</h2>
						{!isDrawerEditMode && !isDrawerAddMode ? (
							<IconButton ariaLabel={t("globalConnections.buttons.add")} onClick={handleAddClick}>
								<PlusIcon className="size-4 fill-white transition hover:fill-green-800" />
							</IconButton>
						) : null}
					</div>
					<IconButton ariaLabel={t("globalConnections.buttons.close")} onClick={closeDrawer}>
						<Close className="size-4 fill-white transition hover:fill-green-800" />
					</IconButton>
				</div>

				{isDrawerEditMode && selectedGlobalConnectionId ? (
					<div className="flex-1 overflow-y-auto">
						<EditConnection
							connectionId={selectedGlobalConnectionId}
							isDrawerMode
							isGlobalConnection
							onBack={handleBackToList}
							onSuccess={handleConnectionSuccess}
						/>
					</div>
				) : isDrawerAddMode ? (
					<div className="flex-1 overflow-y-auto">
						<AddConnection
							isDrawerMode
							isGlobalConnection
							onBack={handleBackToList}
							onSuccess={handleConnectionSuccess}
						/>
					</div>
				) : (
					<div className="flex-1 overflow-hidden">
						<GlobalConnectionsList isDrawerMode onConnectionClick={setSelectedGlobalConnectionId} />
					</div>
				)}
			</div>
		</Drawer>
	);
};
