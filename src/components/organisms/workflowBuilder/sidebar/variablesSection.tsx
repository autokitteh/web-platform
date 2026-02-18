import React, { useCallback, useState } from "react";

import { LuChevronDown, LuEye, LuEyeOff, LuLock, LuLockOpen, LuPlus, LuSettings, LuTrash2 } from "react-icons/lu";

import { ProjectVariable } from "@interfaces/components/workflowBuilder.interface";
import { cn } from "@src/utilities";
import { useWorkflowBuilderStore } from "@store/useWorkflowBuilderStore";

import { Input, Typography } from "@components/atoms";

interface VariableItemProps {
	variable: ProjectVariable;
	onUpdate: (id: string, updates: Partial<ProjectVariable>) => void;
	onDelete: (id: string) => void;
}

const VariableItem = ({ variable, onUpdate, onDelete }: VariableItemProps) => {
	const [isEditing, setIsEditing] = useState(false);
	const [showValue, setShowValue] = useState(false);
	const [editName, setEditName] = useState(variable.name);
	const [editValue, setEditValue] = useState(variable.value);

	const handleSave = useCallback(() => {
		onUpdate(variable.id, { name: editName, value: editValue });
		setIsEditing(false);
	}, [variable.id, editName, editValue, onUpdate]);

	const handleCancel = useCallback(() => {
		setEditName(variable.name);
		setEditValue(variable.value);
		setIsEditing(false);
	}, [variable.name, variable.value]);

	const toggleSecret = useCallback(() => {
		onUpdate(variable.id, { isSecret: !variable.isSecret });
	}, [variable.id, variable.isSecret, onUpdate]);

	if (isEditing) {
		return (
			<div className="space-y-2 rounded-lg border border-blue-500/50 bg-gray-900 p-3">
				<Input
					className="!bg-gray-800"
					onChange={(e) => setEditName(e.target.value)}
					placeholder="Variable name"
					value={editName}
				/>
				<div className="relative">
					<Input
						className="!bg-gray-800 pr-10"
						onChange={(e) => setEditValue(e.target.value)}
						placeholder="Value"
						type={variable.isSecret && !showValue ? "password" : "text"}
						value={editValue}
					/>
					{variable.isSecret ? (
						<button
							className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
							onClick={() => setShowValue(!showValue)}
							type="button"
						>
							{showValue ? <LuEyeOff className="size-4" /> : <LuEye className="size-4" />}
						</button>
					) : null}
				</div>
				<div className="flex items-center justify-between">
					<button
						className="flex items-center gap-1 text-10 text-gray-400 hover:text-white"
						onClick={toggleSecret}
						type="button"
					>
						{variable.isSecret ? (
							<>
								<LuLock className="size-3" /> Secret
							</>
						) : (
							<>
								<LuLockOpen className="size-3" /> Not secret
							</>
						)}
					</button>
					<div className="flex gap-2">
						<button
							className="rounded bg-gray-700 px-2 py-1 text-10 text-gray-300 hover:bg-gray-600"
							onClick={handleCancel}
							type="button"
						>
							Cancel
						</button>
						<button
							className="rounded bg-blue-600 px-2 py-1 text-10 text-white hover:bg-blue-500"
							onClick={handleSave}
							type="button"
						>
							Save
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="group flex items-center justify-between rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 transition-colors hover:border-gray-600">
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-1.5">
					{variable.isSecret ? <LuLock className="size-3 text-amber-500" /> : null}
					<Typography className="truncate font-mono text-white" element="span" size="small">
						{variable.name}
					</Typography>
				</div>
				<Typography className="truncate text-gray-500" element="span" size="small">
					{variable.isSecret ? "••••••••" : variable.value || "(empty)"}
				</Typography>
			</div>
			<div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
				<button
					className="rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
					onClick={() => setIsEditing(true)}
					type="button"
				>
					<LuSettings className="size-3.5" />
				</button>
				<button
					className="rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-red-400"
					onClick={() => onDelete(variable.id)}
					type="button"
				>
					<LuTrash2 className="size-3.5" />
				</button>
			</div>
		</div>
	);
};

export const VariablesSection = () => {
	const [isExpanded, setIsExpanded] = useState(true);
	const [isAdding, setIsAdding] = useState(false);
	const [newName, setNewName] = useState("");
	const [newValue, setNewValue] = useState("");
	const [newIsSecret, setNewIsSecret] = useState(false);

	const { variables, addVariable, updateVariable, removeVariable } = useWorkflowBuilderStore();

	const handleAddVariable = useCallback(() => {
		if (!newName.trim()) return;

		const newVar: ProjectVariable = {
			id: `var-${Date.now()}`,
			name: newName.trim().toUpperCase().replace(/\s+/g, "_"),
			value: newValue,
			isSecret: newIsSecret,
		};

		addVariable(newVar);
		setNewName("");
		setNewValue("");
		setNewIsSecret(false);
		setIsAdding(false);
	}, [newName, newValue, newIsSecret, addVariable]);

	const handleCancelAdd = useCallback(() => {
		setNewName("");
		setNewValue("");
		setNewIsSecret(false);
		setIsAdding(false);
	}, []);

	return (
		<div className="border-b border-gray-750">
			<button
				className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-900"
				onClick={() => setIsExpanded(!isExpanded)}
				type="button"
			>
				<div className="flex items-center gap-2">
					<LuSettings className="size-4 text-gray-400" />
					<Typography className="font-medium text-white" element="span" size="small">
						Variables
					</Typography>
					{variables.length > 0 ? (
						<span className="rounded-full bg-gray-700 px-1.5 py-0.5 text-10 text-gray-300">
							{variables.length}
						</span>
					) : null}
				</div>
				<LuChevronDown
					className={cn("size-4 text-gray-400 transition-transform", isExpanded && "rotate-180")}
				/>
			</button>

			{isExpanded ? (
				<div className="space-y-2 px-4 pb-4">
					{variables.map((variable) => (
						<VariableItem
							key={variable.id}
							onDelete={removeVariable}
							onUpdate={updateVariable}
							variable={variable}
						/>
					))}

					{isAdding ? (
						<div className="space-y-2 rounded-lg border border-green-500/50 bg-gray-900 p-3">
							<Input
								className="!bg-gray-800 font-mono uppercase"
								onChange={(e) => setNewName(e.target.value)}
								placeholder="VARIABLE_NAME"
								value={newName}
							/>
							<Input
								className="!bg-gray-800"
								onChange={(e) => setNewValue(e.target.value)}
								placeholder="Value"
								type={newIsSecret ? "password" : "text"}
								value={newValue}
							/>
							<div className="flex items-center justify-between">
								<button
									className="flex items-center gap-1 text-10 text-gray-400 hover:text-white"
									onClick={() => setNewIsSecret(!newIsSecret)}
									type="button"
								>
									{newIsSecret ? (
										<>
											<LuLock className="size-3" /> Secret
										</>
									) : (
										<>
											<LuLockOpen className="size-3" /> Not secret
										</>
									)}
								</button>
								<div className="flex gap-2">
									<button
										className="rounded bg-gray-700 px-2 py-1 text-10 text-gray-300 hover:bg-gray-600"
										onClick={handleCancelAdd}
										type="button"
									>
										Cancel
									</button>
									<button
										className="rounded bg-green-600 px-2 py-1 text-10 text-white hover:bg-green-500"
										disabled={!newName.trim()}
										onClick={handleAddVariable}
										type="button"
									>
										Add
									</button>
								</div>
							</div>
						</div>
					) : (
						<button
							className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-600 py-2 text-gray-400 transition-colors hover:border-gray-400 hover:bg-gray-900 hover:text-white"
							onClick={() => setIsAdding(true)}
							type="button"
						>
							<LuPlus className="size-4" />
							<Typography element="span" size="small">
								Add Variable
							</Typography>
						</button>
					)}
				</div>
			) : null}
		</div>
	);
};
