import React, { useCallback, useEffect, useMemo } from "react";

import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "react-router-dom";

import { EventListenerName } from "@src/enums";
import { DrawerName } from "@src/enums/components";
import { useEventListener } from "@src/hooks";
import { useGlobalConnectionsStore, useOrganizationStore, useSharedBetweenProjectsStore } from "@src/store";
import { Connection } from "@src/types/models";
import { cn } from "@src/utilities";

import { Button, IconButton, Loader, TBody, Table } from "@components/atoms";
import { Drawer } from "@components/molecules";
import { EditConnection } from "@components/organisms/configuration/connections/edit";
import { ConnectionsTableHeader } from "@components/organisms/globalConnections/table/header";
import { ConnectionRow } from "@components/organisms/globalConnections/table/row";

import { ArrowLeft, Close } from "@assets/image/icons";

export const GlobalConnectionsDrawer = () => {
	const { t } = useTranslation("connections");
	const location = useLocation();
	const { projectId: projectIdUrlParam } = useParams();
	const openDrawer = useSharedBetweenProjectsStore((state) => state.openDrawer);
	const closeDrawer = useSharedBetweenProjectsStore((state) => state.closeDrawer);

	const { currentOrganization } = useOrganizationStore();
	const {
		isLoading,
		fetchGlobalConnections,
		globalConnections,
		selectedGlobalConnectionId,
		setSelectedGlobalConnectionId,
		isDrawerEditMode,
		setDrawerEditMode,
		resetDrawerState,
	} = useGlobalConnectionsStore();

	useEffect(() => {
		if (currentOrganization?.id) {
			fetchGlobalConnections(currentOrganization.id);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentOrganization?.id]);

	const open = useCallback(() => {
		if (!projectIdUrlParam) return;
		openDrawer(projectIdUrlParam, DrawerName.globalConnections);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectIdUrlParam]);

	const close = useCallback(() => {
		if (!projectIdUrlParam) return;
		resetDrawerState();
		closeDrawer(projectIdUrlParam, DrawerName.globalConnections);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectIdUrlParam]);

	useEventListener(EventListenerName.displayGlobalConnectionsDrawer, open);
	useEventListener(EventListenerName.hideGlobalConnectionsDrawer, close);

	useEffect(() => {
		const handleEscapeKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				if (isDrawerEditMode) {
					setSelectedGlobalConnectionId(undefined);
					setDrawerEditMode(false);
				} else {
					close();
				}
			}
		};

		document.addEventListener("keydown", handleEscapeKey);

		return () => {
			document.removeEventListener("keydown", handleEscapeKey);
		};
	}, [close, isDrawerEditMode, setSelectedGlobalConnectionId, setDrawerEditMode]);

	const handleConnectionClick = useCallback(
		(connectionId: string) => {
			setSelectedGlobalConnectionId(connectionId);
		},
		[setSelectedGlobalConnectionId]
	);

	const handleBackToList = useCallback(() => {
		setSelectedGlobalConnectionId(undefined);
		setDrawerEditMode(false);
	}, [setSelectedGlobalConnectionId, setDrawerEditMode]);

	const tableContent = useMemo(() => {
		if (isLoading) {
			return <Loader isCenter size="xl" />;
		}

		if (!globalConnections?.length) {
			return <div className="mt-4 text-center text-xl font-semibold">{t("noConnectionsFound")}</div>;
		}

		return (
			<div className="mt-4 h-full overflow-auto">
				<Table className="relative w-full overflow-visible">
					<ConnectionsTableHeader />
					<TBody className="max-h-[calc(100vh-200px)] overflow-y-auto">
						{globalConnections.map((globalConnection: Connection) => (
							<ConnectionRow
								connection={globalConnection}
								key={globalConnection.connectionId}
								onConfigure={() => handleConnectionClick(globalConnection.connectionId)}
								onDelete={() => {}}
							/>
						))}
					</TBody>
				</Table>
			</div>
		);
	}, [isLoading, globalConnections, t, handleConnectionClick]);

	if (!location.pathname.startsWith("/projects") || !projectIdUrlParam) {
		return null;
	}

	const headerClass = cn("mb-4 flex items-center justify-between border-b border-gray-750 pb-4");

	return (
		<Drawer
			bgClickable
			divId="global-connections-drawer"
			name={DrawerName.globalConnections}
			position="left"
			variant="dark"
			width={50}
		>
			<div className="flex h-full flex-col">
				<div className={headerClass}>
					<div className="flex items-center gap-2">
						{isDrawerEditMode ? (
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
							{isDrawerEditMode ? t("globalConnections.editTitle") : t("globalConnections.title")}
						</h2>
					</div>
					<IconButton ariaLabel={t("globalConnections.buttons.close")} onClick={close}>
						<Close className="size-4 fill-white transition hover:fill-green-800" />
					</IconButton>
				</div>

				{isDrawerEditMode && selectedGlobalConnectionId ? (
					<div className="flex-1 overflow-y-auto">
						<EditConnection connectionId={selectedGlobalConnectionId} onBack={handleBackToList} />
					</div>
				) : (
					<div className="flex-1 overflow-hidden">{tableContent}</div>
				)}
			</div>
		</Drawer>
	);
};
