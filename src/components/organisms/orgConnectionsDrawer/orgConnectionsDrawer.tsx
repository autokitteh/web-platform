import React, { useCallback, useEffect } from "react";

import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "react-router-dom";

import { EventListenerName } from "@src/enums";
import { DrawerName } from "@src/enums/components";
import { useEventListener } from "@src/hooks";
import { useOrgConnectionsStore, useOrganizationStore } from "@src/store";
import { cn } from "@src/utilities";

import { Button, IconButton } from "@components/atoms";
import { Drawer } from "@components/molecules";
import { AddConnection } from "@components/organisms/configuration/connections/add";
import { EditConnection } from "@components/organisms/configuration/connections/edit";
import { OrgConnectionsList } from "@components/organisms/orgConnections/list";

import { ArrowLeft, Close, PlusIcon } from "@assets/image/icons";

export const OrgConnectionsDrawer = () => {
	const { t } = useTranslation("connections");
	const location = useLocation();
	const { projectId: projectIdUrlParam } = useParams();

	const { currentOrganization } = useOrganizationStore();
	const {
		fetchOrgConnections,
		selectedOrgConnectionId,
		setSelectedOrgConnectionId,
		isDrawerOpen,
		openDrawer,
		closeDrawer,
		isDrawerEditMode,
		setDrawerEditMode,
		isDrawerAddMode,
		setDrawerAddMode,
	} = useOrgConnectionsStore();

	useEffect(() => {
		if (currentOrganization?.id) {
			fetchOrgConnections(currentOrganization.id);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentOrganization?.id]);

	useEventListener(EventListenerName.displayOrgConnectionsDrawer, openDrawer);
	useEventListener(EventListenerName.hideOrgConnectionsDrawer, closeDrawer);

	const handleBackToList = useCallback(() => {
		setSelectedOrgConnectionId(undefined);
		setDrawerEditMode(false);
		setDrawerAddMode(false);
	}, [setSelectedOrgConnectionId, setDrawerEditMode, setDrawerAddMode]);

	const handleConnectionSuccess = useCallback(() => {
		if (currentOrganization?.id) {
			fetchOrgConnections(currentOrganization.id);
		}
		handleBackToList();
	}, [currentOrganization?.id, fetchOrgConnections, handleBackToList]);

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
			divId="org-connections-drawer"
			isForcedOpen={isDrawerOpen}
			name={DrawerName.orgConnections}
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
								ariaLabel={t("orgConnections.buttons.backToList")}
								className="mr-2"
								onClick={handleBackToList}
								variant="filledGray"
							>
								<ArrowLeft className="size-4 hover:stroke-green-800" />
							</Button>
						) : null}
						<h2 className="text-xl font-semibold text-white">
							{isDrawerEditMode
								? t("orgConnections.editTitle")
								: isDrawerAddMode
									? t("orgConnections.addTitle")
									: t("orgConnections.title")}
						</h2>
						{!isDrawerEditMode && !isDrawerAddMode ? (
							<IconButton ariaLabel={t("orgConnections.buttons.add")} onClick={handleAddClick}>
								<PlusIcon className="size-4 fill-white transition hover:fill-green-800" />
							</IconButton>
						) : null}
					</div>
					<IconButton ariaLabel={t("orgConnections.buttons.close")} onClick={closeDrawer}>
						<Close className="size-4 fill-white transition hover:fill-green-800" />
					</IconButton>
				</div>

				{isDrawerEditMode && selectedOrgConnectionId ? (
					<div className="flex-1 overflow-y-auto">
						<EditConnection
							connectionId={selectedOrgConnectionId}
							isDrawerMode
							isOrgConnection
							onBack={handleBackToList}
							onSuccess={handleConnectionSuccess}
						/>
					</div>
				) : isDrawerAddMode ? (
					<div className="flex-1 overflow-y-auto">
						<AddConnection
							isDrawerMode
							isOrgConnection
							onBack={handleBackToList}
							onSuccess={handleConnectionSuccess}
						/>
					</div>
				) : (
					<div className="flex-1 overflow-hidden">
						<OrgConnectionsList isDrawerMode onConnectionClick={setSelectedOrgConnectionId} />
					</div>
				)}
			</div>
		</Drawer>
	);
};
