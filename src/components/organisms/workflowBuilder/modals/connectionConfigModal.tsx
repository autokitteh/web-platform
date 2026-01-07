import React, { useCallback, useEffect, useState } from "react";

import { LuCheck, LuLoader, LuX } from "react-icons/lu";

import { ConnectionNodeData, ConnectionStatus } from "@interfaces/components/workflowBuilder.interface";
import { ModalName } from "@src/enums";
import { fitleredIntegrationsMap, Integrations } from "@src/enums/components";
import { cn } from "@src/utilities";
import { useModalStore } from "@store/useModalStore";
import { useWorkflowBuilderStore } from "@store/useWorkflowBuilderStore";

import { Button, IconSvg, Input, Typography } from "@components/atoms";
import { Modal } from "@components/molecules";

const statusConfig: Record<ConnectionStatus, { color: string; icon: React.ElementType | null; label: string }> = {
	disconnected: { label: "Disconnected", color: "text-gray-400", icon: null },
	connected: { label: "Connected", color: "text-green-400", icon: LuCheck },
	active: { label: "Active", color: "text-blue-400", icon: LuCheck },
	error: { label: "Error", color: "text-red-400", icon: LuX },
};

export const ConnectionConfigModal = () => {
	const { closeModal, getModalData } = useModalStore();
	const { nodes, updateNode, getCodeNodes } = useWorkflowBuilderStore();

	const modalData = getModalData<{ connectionName: string; nodeId: string }>(ModalName.connectionConfig);
	const nodeId = modalData?.nodeId;

	const currentNode = nodes.find((n) => n.id === nodeId && n.type === "connection");
	const nodeData = currentNode?.data as ConnectionNodeData | undefined;

	const integration = nodeData ? fitleredIntegrationsMap[nodeData.integration as Integrations] : null;

	const codeNodes = getCodeNodes();
	const usedByFunctions = codeNodes.flatMap((node) =>
		node.data.usedConnections.includes(nodeData?.connectionName || "")
			? node.data.entryPoints.map((ep) => ep.name)
			: []
	);

	const [connectionName, setConnectionName] = useState(nodeData?.connectionName || "");
	const [status, setStatus] = useState<ConnectionStatus>(nodeData?.status || "disconnected");
	const [isTesting, setIsTesting] = useState(false);

	useEffect(() => {
		if (nodeData) {
			setConnectionName(nodeData.connectionName);
			setStatus(nodeData.status);
		}
	}, [nodeData]);

	const handleTestConnection = useCallback(async () => {
		setIsTesting(true);
		await new Promise((resolve) => setTimeout(resolve, 1500));
		setStatus("connected");
		setIsTesting(false);
	}, []);

	const handleSave = useCallback(() => {
		if (!nodeId) return;

		const updatedData: Partial<ConnectionNodeData> = {
			connectionName,
			status,
		};

		updateNode(nodeId, updatedData);
		closeModal(ModalName.connectionConfig);
	}, [nodeId, connectionName, status, updateNode, closeModal]);

	const handleCancel = useCallback(() => {
		closeModal(ModalName.connectionConfig);
	}, [closeModal]);

	const handleDisconnect = useCallback(() => {
		setStatus("disconnected");
	}, []);

	const statusInfo = statusConfig[status];
	const StatusIcon = statusInfo.icon;

	return (
		<Modal name={ModalName.connectionConfig} variant="dark">
			<div className="w-[480px]">
				<div className="mb-6 flex items-start gap-4">
					{integration?.icon ? (
						<div className="flex size-16 items-center justify-center rounded-xl bg-white p-2">
							<IconSvg className="size-12" src={integration.icon} />
						</div>
					) : null}
					<div>
						<Typography className="text-white" variant="h2">
							Configure Connection
						</Typography>
						<Typography className="mt-1 text-gray-400" element="p" size="small">
							{nodeData?.displayName || "Unknown Integration"}
						</Typography>
					</div>
				</div>

				<div className="space-y-5">
					<div>
						<Typography className="mb-2 text-gray-300" element="label" size="small">
							Connection Name
						</Typography>
						<Input
							className="font-mono"
							onChange={(e) => setConnectionName(e.target.value)}
							placeholder="my_connection"
							value={connectionName}
						/>
						<Typography className="mt-1 text-gray-500" element="p" size="small">
							Use this name to reference the connection in your code
						</Typography>
					</div>

					<div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
						<div className="flex items-center justify-between">
							<div>
								<Typography className="text-gray-300" element="span" size="small">
									Status
								</Typography>
								<div className="mt-1 flex items-center gap-2">
									{StatusIcon ? (
										<StatusIcon className={cn("size-4", statusInfo.color)} />
									) : (
										<span className="size-2 rounded-full bg-gray-500" />
									)}
									<Typography className={statusInfo.color} element="span" size="small">
										{statusInfo.label}
									</Typography>
								</div>
							</div>
							<div className="flex gap-2">
								{status === "connected" || status === "active" ? (
									<Button
										ariaLabel="Disconnect"
										className="px-3 py-1.5 text-sm"
										onClick={handleDisconnect}
										variant="outline"
									>
										Disconnect
									</Button>
								) : null}
								<Button
									ariaLabel="Test Connection"
									className="px-4 py-1.5 text-sm text-gray-300"
									disabled={isTesting}
									onClick={handleTestConnection}
									variant="outline"
								>
									{isTesting ? (
										<>
											<LuLoader className="mr-2 size-4 animate-spin" />
											Testing...
										</>
									) : (
										"Test Connection"
									)}
								</Button>
							</div>
						</div>
					</div>

					{status === "disconnected" ? (
						<div className="rounded-lg border border-amber-500/30 bg-amber-900/10 p-4">
							<Typography className="mb-2 text-amber-400" element="span" size="small">
								Authentication Required
							</Typography>
							<Typography className="text-gray-400" element="p" size="small">
								This connection needs to be authenticated before it can be used. Click the button below
								to set up authentication.
							</Typography>
							<Button
								ariaLabel="Set up authentication"
								className="mt-3 w-full pl-4 text-gray-300"
								variant="outline"
							>
								Set Up Authentication
							</Button>
						</div>
					) : null}

					{usedByFunctions.length > 0 ? (
						<div>
							<Typography className="mb-2 text-gray-300" element="label" size="small">
								Used in Code
							</Typography>
							<div className="rounded-lg border border-gray-700 bg-gray-950 p-3">
								{usedByFunctions.map((fn) => (
									<div className="flex items-center gap-2 py-1" key={fn}>
										<span className="size-1.5 rounded-full bg-green-500" />
										<Typography className="font-mono text-gray-300" element="span" size="small">
											{fn}()
										</Typography>
									</div>
								))}
							</div>
						</div>
					) : (
						<div className="rounded-lg border border-gray-700 bg-gray-950 p-3">
							<Typography className="text-center text-gray-500" element="p" size="small">
								This connection is not used in any code files yet
							</Typography>
						</div>
					)}
				</div>

				<div className="mt-8 flex justify-end gap-3">
					<Button
						ariaLabel="Cancel"
						className="px-4 py-2 text-gray-300"
						onClick={handleCancel}
						variant="outline"
					>
						Cancel
					</Button>
					<Button ariaLabel="Save" className="px-4 py-2" onClick={handleSave} variant="filled">
						Save Connection
					</Button>
				</div>
			</div>
		</Modal>
	);
};
