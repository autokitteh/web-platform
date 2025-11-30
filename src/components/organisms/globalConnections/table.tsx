import React, { useCallback, useEffect, useId, useMemo } from "react";

import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";

import { useResize } from "@src/hooks";
import { useGlobalConnectionsStore, useOrganizationStore } from "@src/store";
import { cn } from "@src/utilities";

import { Frame, ResizeButton } from "@components/atoms";
import { AddButton } from "@components/molecules";
import { GlobalConnectionsList } from "@components/organisms/globalConnections/list";
import { NoConnectionSelected } from "@components/organisms/globalConnections/notSelected";

export const GlobalConnectionsTable = () => {
	const { t } = useTranslation("connections");
	const resizeId = useId();
	const navigate = useNavigate();
	const location = useLocation();
	const { id: connectionId } = useParams();
	const [leftSideWidth] = useResize({ direction: "horizontal", initial: 50, max: 90, min: 10, id: resizeId });

	const isAddMode = location.pathname === "/connections/new";
	const isEditMode = location.pathname.endsWith("/edit");
	const isFormMode = isAddMode || isEditMode;

	const { currentOrganization } = useOrganizationStore();
	const { isLoading, fetchGlobalConnections, setSelectedGlobalConnectionId } = useGlobalConnectionsStore();

	useEffect(() => {
		if (currentOrganization?.id) {
			fetchGlobalConnections(currentOrganization.id);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentOrganization?.id]);

	useEffect(() => {
		if (connectionId && !isFormMode) {
			setSelectedGlobalConnectionId(connectionId);
		} else if (!connectionId) {
			setSelectedGlobalConnectionId(undefined);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId, isFormMode]);

	const handleAddConnection = useCallback(() => {
		navigate("/connections/new");
	}, [navigate]);

	const frameClass = useMemo(() => cn("size-full rounded-r-none bg-gray-1100 pb-3 pl-7 transition-all"), []);

	const renderRightPanel = () => {
		if (isFormMode) {
			return (
				<Frame className="overflow-y-auto overflow-x-hidden rounded-l-none px-12 py-10">
					<Outlet />
				</Frame>
			);
		}

		return <NoConnectionSelected />;
	};

	return (
		<div className="flex size-full">
			<div style={{ width: `${leftSideWidth}%` }}>
				<Frame className={frameClass}>
					<div className="flex w-full items-center justify-end">
						<AddButton
							addButtonLabel={t("globalConnections.buttons.add")}
							isLoading={isLoading}
							onAdd={handleAddConnection}
							title={t("globalConnections.buttons.connection")}
						/>
					</div>
					<GlobalConnectionsList />
				</Frame>
			</div>

			<ResizeButton className="hover:bg-white" direction="horizontal" resizeId={resizeId} />

			<div className="flex rounded-2xl bg-black" style={{ width: `${100 - leftSideWidth}%` }}>
				{renderRightPanel()}
			</div>
		</div>
	);
};

GlobalConnectionsTable.displayName = "GlobalConnectionsTable";
