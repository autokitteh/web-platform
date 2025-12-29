import React, { useCallback, useEffect, useState } from "react";

import { LuClock, LuLink, LuZap } from "react-icons/lu";

import { TriggerNodeData, TriggerType } from "@interfaces/components/workflowBuilder.interface";
import { ModalName } from "@src/enums";
import { cn } from "@src/utilities";
import { useModalStore } from "@store/useModalStore";
import { useWorkflowBuilderStore } from "@store/useWorkflowBuilderStore";

import { Button, Input, Typography } from "@components/atoms";
import { Modal } from "@components/molecules";

const triggerTypes: { color: string; icon: React.ElementType; label: string; type: TriggerType }[] = [
	{ type: "schedule", label: "Schedule", icon: LuClock, color: "text-amber-400" },
	{ type: "webhook", label: "Webhook", icon: LuLink, color: "text-purple-400" },
	{ type: "event", label: "Event", icon: LuZap, color: "text-blue-400" },
];

const cronPresets = [
	{ label: "Every minute", value: "* * * * *" },
	{ label: "Every hour", value: "0 * * * *" },
	{ label: "Daily at midnight", value: "0 0 * * *" },
	{ label: "Weekly (Sunday)", value: "0 0 * * 0" },
	{ label: "Bi-weekly", value: "0 6 * * 0" },
	{ label: "Monthly", value: "0 0 1 * *" },
];

const httpMethods = ["GET", "POST", "PUT", "DELETE"] as const;

export const TriggerConfigModal = () => {
	const { closeModal, getModalData } = useModalStore();
	const { nodes, updateNode, getCodeNodes } = useWorkflowBuilderStore();

	const modalData = getModalData<{ nodeId: string }>(ModalName.triggerConfig);
	const nodeId = modalData?.nodeId;

	const currentNode = nodes.find((n) => n.id === nodeId && n.type === "trigger");
	const nodeData = currentNode?.data as TriggerNodeData | undefined;

	const codeNodes = getCodeNodes();
	const entryPoints = codeNodes.flatMap((node) =>
		node.data.entryPoints.map((ep) => ({
			value: `${node.data.fileName}:${ep.name}`,
			label: `${node.data.fileName}:${ep.name}()`,
		}))
	);

	const [triggerType, setTriggerType] = useState<TriggerType>(nodeData?.type || "schedule");
	const [name, setName] = useState(nodeData?.name || "");
	const [schedule, setSchedule] = useState(nodeData?.schedule || "0 * * * *");
	const [webhookPath, setWebhookPath] = useState(nodeData?.webhookPath || "/webhook");
	const [httpMethod, setHttpMethod] = useState<(typeof httpMethods)[number]>(nodeData?.httpMethod || "POST");
	const [eventType, setEventType] = useState(nodeData?.eventType || "");
	const [call, setCall] = useState(nodeData?.call || "");
	const [isDurable, setIsDurable] = useState(nodeData?.isDurable ?? true);

	useEffect(() => {
		if (nodeData) {
			setTriggerType(nodeData.type);
			setName(nodeData.name);
			setSchedule(nodeData.schedule || "0 * * * *");
			setWebhookPath(nodeData.webhookPath || "/webhook");
			setHttpMethod(nodeData.httpMethod || "POST");
			setEventType(nodeData.eventType || "");
			setCall(nodeData.call);
			setIsDurable(nodeData.isDurable);
		}
	}, [nodeData]);

	const handleSave = useCallback(() => {
		if (!nodeId) return;

		const updatedData: Partial<TriggerNodeData> = {
			type: triggerType,
			name: name || `${triggerType}_trigger`,
			call,
			isDurable,
			status: call ? "configured" : "draft",
		};

		if (triggerType === "schedule") {
			updatedData.schedule = schedule;
		} else if (triggerType === "webhook") {
			updatedData.webhookPath = webhookPath;
			updatedData.httpMethod = httpMethod;
		} else if (triggerType === "event") {
			updatedData.eventType = eventType;
		}

		updateNode(nodeId, updatedData);
		closeModal(ModalName.triggerConfig);
	}, [
		nodeId,
		triggerType,
		name,
		schedule,
		webhookPath,
		httpMethod,
		eventType,
		call,
		isDurable,
		updateNode,
		closeModal,
	]);

	const handleCancel = useCallback(() => {
		closeModal(ModalName.triggerConfig);
	}, [closeModal]);

	return (
		<Modal name={ModalName.triggerConfig} variant="dark">
			<div className="w-[480px]">
				<Typography className="mb-6 text-white" variant="h2">
					Configure Trigger
				</Typography>

				<div className="space-y-5">
					<div>
						<Typography className="mb-2 text-gray-300" element="label" size="small">
							Trigger Name
						</Typography>
						<Input onChange={(e) => setName(e.target.value)} placeholder="my_trigger" value={name} />
					</div>

					<div>
						<Typography className="mb-2 text-gray-300" element="label" size="small">
							Trigger Type
						</Typography>
						<div className="flex gap-2">
							{triggerTypes.map((t) => {
								const Icon = t.icon;
								return (
									<button
										className={cn(
											"flex flex-1 items-center justify-center gap-2 rounded-lg border-2 py-3 transition-all",
											triggerType === t.type
												? "border-blue-500 bg-blue-900/20"
												: "border-gray-700 bg-gray-900 hover:border-gray-600"
										)}
										key={t.type}
										onClick={() => setTriggerType(t.type)}
										type="button"
									>
										<Icon className={cn("size-5", t.color)} />
										<span className="text-sm text-white">{t.label}</span>
									</button>
								);
							})}
						</div>
					</div>

					{triggerType === "schedule" ? (
						<div>
							<Typography className="mb-2 text-gray-300" element="label" size="small">
								Cron Expression
							</Typography>
							<Input
								className="font-mono"
								onChange={(e) => setSchedule(e.target.value)}
								placeholder="0 * * * *"
								value={schedule}
							/>
							<div className="mt-2 flex flex-wrap gap-1">
								{cronPresets.map((preset) => (
									<button
										className={cn(
											"rounded-full px-2 py-0.5 text-xs transition-colors",
											schedule === preset.value
												? "bg-amber-900/50 text-amber-300"
												: "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
										)}
										key={preset.value}
										onClick={() => setSchedule(preset.value)}
										type="button"
									>
										{preset.label}
									</button>
								))}
							</div>
						</div>
					) : null}

					{triggerType === "webhook" ? (
						<>
							<div>
								<Typography className="mb-2 text-gray-300" element="label" size="small">
									HTTP Method
								</Typography>
								<div className="flex gap-2">
									{httpMethods.map((method) => (
										<button
											className={cn(
												"flex-1 rounded-lg border py-2 text-sm transition-all",
												httpMethod === method
													? "border-purple-500 bg-purple-900/20 text-purple-300"
													: "border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600"
											)}
											key={method}
											onClick={() => setHttpMethod(method)}
											type="button"
										>
											{method}
										</button>
									))}
								</div>
							</div>
							<div>
								<Typography className="mb-2 text-gray-300" element="label" size="small">
									Webhook Path
								</Typography>
								<Input
									onChange={(e) => setWebhookPath(e.target.value)}
									placeholder="/webhook/my-endpoint"
									value={webhookPath}
								/>
							</div>
						</>
					) : null}

					{triggerType === "event" ? (
						<div>
							<Typography className="mb-2 text-gray-300" element="label" size="small">
								Event Type
							</Typography>
							<Input
								onChange={(e) => setEventType(e.target.value)}
								placeholder="slack_message_received"
								value={eventType}
							/>
						</div>
					) : null}

					<div>
						<Typography className="mb-2 text-gray-300" element="label" size="small">
							Entry Point (function to call)
						</Typography>
						{entryPoints.length > 0 ? (
							<select
								className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white outline-none focus:border-blue-500"
								onChange={(e) => setCall(e.target.value)}
								value={call}
							>
								<option value="">Select an entry point...</option>
								{entryPoints.map((ep) => (
									<option key={ep.value} value={ep.value}>
										{ep.label}
									</option>
								))}
							</select>
						) : (
							<Input
								onChange={(e) => setCall(e.target.value)}
								placeholder="program.py:main"
								value={call}
							/>
						)}
					</div>

					<div className="flex items-center gap-3">
						<input
							checked={isDurable}
							className="size-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500"
							id="isDurable"
							onChange={(e) => setIsDurable(e.target.checked)}
							type="checkbox"
						/>
						<label className="text-sm text-gray-300" htmlFor="isDurable">
							Durable (survives restarts)
						</label>
					</div>
				</div>

				<div className="mt-8 flex justify-end gap-3">
					<Button ariaLabel="Cancel" className="px-4 py-2" onClick={handleCancel} variant="outline">
						Cancel
					</Button>
					<Button ariaLabel="Save" className="px-4 py-2" onClick={handleSave} variant="filled">
						Save Trigger
					</Button>
				</div>
			</div>
		</Modal>
	);
};
