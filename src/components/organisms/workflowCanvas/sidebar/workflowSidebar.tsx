import React, { memo, useState, useCallback, DragEvent, useMemo } from "react";

import { fitleredIntegrationsMap } from "@enums";
import { TriggerTypes } from "@enums/trigger.enum";
import { SidebarSection, DragItem } from "@interfaces/store/workflowCanvasStore.interface";
import { Variable } from "@src/types/models/variable.type";
import { TreeNode, buildFileTree, cn } from "@utilities";

import { IconSvg, Button } from "@components/atoms";

import {
	ChevronDownIcon,
	ChevronRightIcon,
	PlusIcon,
	ConnectionIcon,
	FileIcon,
	TriggerIcon,
	VariableIcon,
	PythonIcon,
} from "@assets/image/icons";
import { SchedulerIcon, HttpIcon } from "@assets/image/icons/connections";

export interface WorkflowSidebarProps {
	sections: SidebarSection[];
	onDragStart: (event: DragEvent, item: DragItem) => void;
	onItemClick?: (item: DragItem) => void;
	isOpen: boolean;
	onToggle: () => void;
	className?: string;
	resources?: Record<string, Uint8Array>;
	variables?: Variable[];
}

export const WorkflowSidebar = memo(function WorkflowSidebar({
	sections,
	onDragStart,
	onItemClick,
	isOpen,
	onToggle,
	className,
	resources,
	variables,
}: WorkflowSidebarProps) {
	const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
		Integrations: true,
		Triggers: true,
		Files: true,
		Variables: true,
		...Object.fromEntries(sections.map((s) => [s.title, true])),
	});

	const toggleSection = useCallback((title: string) => {
		setExpandedSections((prev) => ({
			...prev,
			[title]: !prev[title],
		}));
	}, []);

	const fileTreeData = useMemo(() => {
		if (!resources) return [];
		const filePaths = Object.keys(resources);
		return buildFileTree(filePaths);
	}, [resources]);

	const integrationItems: DragItem[] = useMemo(() => {
		return Object.values(fitleredIntegrationsMap).map((integration) => ({
			type: "connection" as const,
			label: integration.label,
			icon: integration.icon,
			data: {
				integrationId: integration.value,
				integrationUniqueName: integration.value,
				name: integration.label,
			},
		}));
	}, []);

	const triggerTypeItems: DragItem[] = useMemo(
		() => [
			{
				type: "trigger" as const,
				label: "Scheduler",
				icon: SchedulerIcon,
				data: {
					triggerType: TriggerTypes.schedule,
					name: "Schedule Trigger",
				},
			},
			{
				type: "trigger" as const,
				label: "Webhook",
				icon: HttpIcon,
				data: {
					triggerType: TriggerTypes.webhook,
					name: "Webhook Trigger",
				},
			},
			{
				type: "trigger" as const,
				label: "Connection",
				icon: ConnectionIcon,
				data: {
					triggerType: TriggerTypes.connection,
					name: "Connection Trigger",
				},
			},
		],
		[]
	);

	const variableItems: DragItem[] = useMemo(() => {
		if (!variables) return [];
		return variables.map((variable) => ({
			type: "variable" as const,
			label: variable.name,
			icon: VariableIcon,
			data: {
				name: variable.name,
				isSecret: variable.isSecret,
				value: variable.value,
			},
		}));
	}, [variables]);

	if (!isOpen) {
		return (
			<div
				className={cn(
					"flex flex-col items-center py-4",
					"border-r border-gray-800 bg-gray-900/50 backdrop-blur-sm",
					className
				)}
			>
				<Button
					ariaLabel="Open sidebar"
					className={cn("rounded-lg p-2", "bg-gray-800 hover:bg-gray-700", "transition-colors duration-200")}
					onClick={onToggle}
				>
					<IconSvg className="size-5 text-gray-400" src={ChevronRightIcon} />
				</Button>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"flex w-72 flex-col",
				"border-r border-gray-800 bg-gray-900/50 backdrop-blur-sm",
				"transition-all duration-300",
				className
			)}
		>
			<div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
				<h3 className="text-sm font-semibold text-white">Components</h3>
				<Button
					ariaLabel="Close sidebar"
					className="rounded p-1 transition-colors hover:bg-gray-800"
					onClick={onToggle}
				>
					<IconSvg className="size-4 rotate-180 text-gray-400" src={ChevronRightIcon} />
				</Button>
			</div>

			<div className="flex-1 overflow-y-auto py-2">
				<IntegrationsCatalogSection
					isExpanded={expandedSections["Integrations"] ?? true}
					items={integrationItems}
					onDragStart={onDragStart}
					onItemClick={onItemClick}
					onToggle={() => toggleSection("Integrations")}
				/>

				<TriggerTypesCatalogSection
					isExpanded={expandedSections["Triggers"] ?? true}
					items={triggerTypeItems}
					onDragStart={onDragStart}
					onItemClick={onItemClick}
					onToggle={() => toggleSection("Triggers")}
				/>

				<FileTreeSection
					fileTree={fileTreeData}
					isExpanded={expandedSections["Files"] ?? true}
					onDragStart={onDragStart}
					onItemClick={onItemClick}
					onToggle={() => toggleSection("Files")}
				/>

				<VariablesSection
					isExpanded={expandedSections["Variables"] ?? true}
					items={variableItems}
					onDragStart={onDragStart}
					onItemClick={onItemClick}
					onToggle={() => toggleSection("Variables")}
				/>

				{sections.map((section) => (
					<SidebarSectionComponent
						isExpanded={expandedSections[section.title] ?? true}
						key={section.title}
						onDragStart={onDragStart}
						onItemClick={onItemClick}
						onToggle={() => toggleSection(section.title)}
						section={section}
					/>
				))}
			</div>

			<div className="border-t border-gray-800 px-4 py-3">
				<p className="text-xs text-gray-500">Drag items onto the canvas or click to add them.</p>
			</div>
		</div>
	);
});

interface IntegrationsCatalogSectionProps {
	isExpanded: boolean;
	onToggle: () => void;
	items: DragItem[];
	onDragStart: (event: DragEvent, item: DragItem) => void;
	onItemClick?: (item: DragItem) => void;
}

const IntegrationsCatalogSection = memo(function IntegrationsCatalogSection({
	isExpanded,
	onToggle,
	items,
	onDragStart,
	onItemClick,
}: IntegrationsCatalogSectionProps) {
	return (
		<div className="mb-2">
			<button
				className={cn(
					"flex w-full items-center gap-2 px-4 py-2",
					"text-left text-sm font-medium text-gray-300",
					"transition-colors hover:bg-gray-800/50"
				)}
				onClick={onToggle}
				type="button"
			>
				<IconSvg className="size-4 text-emerald-400" src={ConnectionIcon} />
				<IconSvg className="size-4 text-gray-500" src={isExpanded ? ChevronDownIcon : ChevronRightIcon} />
				<span>Integrations</span>
				<span className="ml-auto text-xs text-gray-600">{items.length}</span>
			</button>

			{isExpanded ? (
				<div className="grid grid-cols-4 gap-2 px-3 py-2">
					{items.map((item, index) => (
						<IntegrationCatalogItem
							item={item}
							key={`${item.label}-${index}`}
							onClick={() => onItemClick?.(item)}
							onDragStart={onDragStart}
						/>
					))}
				</div>
			) : null}
		</div>
	);
});

interface IntegrationCatalogItemProps {
	item: DragItem;
	onDragStart: (event: DragEvent, item: DragItem) => void;
	onClick?: () => void;
}

const IntegrationCatalogItem = memo(function IntegrationCatalogItem({
	item,
	onDragStart,
	onClick,
}: IntegrationCatalogItemProps) {
	const [isDragging, setIsDragging] = useState(false);

	const handleDragStart = (event: DragEvent) => {
		setIsDragging(true);
		event.dataTransfer.setData("application/reactflow", JSON.stringify(item));
		event.dataTransfer.effectAllowed = "move";
		onDragStart(event, item);
	};

	const handleDragEnd = () => {
		setIsDragging(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			onClick?.();
		}
	};

	const Icon = item.icon || ConnectionIcon;

	return (
		<div
			className={cn(
				"flex cursor-grab flex-col items-center justify-center gap-1 rounded-lg p-2",
				"border-emerald-500/30 border border-dashed transition-all duration-200",
				"hover:bg-emerald-900/20 hover:border-emerald-400/50 hover:shadow-md",
				isDragging && "cursor-grabbing opacity-50"
			)}
			draggable
			onClick={onClick}
			onDragEnd={handleDragEnd}
			onDragStart={handleDragStart}
			onKeyDown={handleKeyDown}
			role="button"
			tabIndex={0}
			title={item.label}
		>
			<IconSvg className="size-6" src={Icon} />
			<span className="max-w-full truncate text-center text-10 text-gray-400">{item.label}</span>
		</div>
	);
});

interface TriggerTypesCatalogSectionProps {
	isExpanded: boolean;
	onToggle: () => void;
	items: DragItem[];
	onDragStart: (event: DragEvent, item: DragItem) => void;
	onItemClick?: (item: DragItem) => void;
}

const TriggerTypesCatalogSection = memo(function TriggerTypesCatalogSection({
	isExpanded,
	onToggle,
	items,
	onDragStart,
	onItemClick,
}: TriggerTypesCatalogSectionProps) {
	return (
		<div className="mb-2">
			<button
				className={cn(
					"flex w-full items-center gap-2 px-4 py-2",
					"text-left text-sm font-medium text-gray-300",
					"transition-colors hover:bg-gray-800/50"
				)}
				onClick={onToggle}
				type="button"
			>
				<IconSvg className="size-4 text-amber-400" src={TriggerIcon} />
				<IconSvg className="size-4 text-gray-500" src={isExpanded ? ChevronDownIcon : ChevronRightIcon} />
				<span>Trigger Types</span>
				<span className="ml-auto text-xs text-gray-600">{items.length}</span>
			</button>

			{isExpanded ? (
				<div className="grid grid-cols-3 gap-2 px-3 py-2">
					{items.map((item, index) => (
						<TriggerCatalogItem
							item={item}
							key={`${item.label}-${index}`}
							onClick={() => onItemClick?.(item)}
							onDragStart={onDragStart}
						/>
					))}
				</div>
			) : null}
		</div>
	);
});

interface TriggerCatalogItemProps {
	item: DragItem;
	onDragStart: (event: DragEvent, item: DragItem) => void;
	onClick?: () => void;
}

const TriggerCatalogItem = memo(function TriggerCatalogItem({ item, onDragStart, onClick }: TriggerCatalogItemProps) {
	const [isDragging, setIsDragging] = useState(false);

	const handleDragStart = (event: DragEvent) => {
		setIsDragging(true);
		event.dataTransfer.setData("application/reactflow", JSON.stringify(item));
		event.dataTransfer.effectAllowed = "move";
		onDragStart(event, item);
	};

	const handleDragEnd = () => {
		setIsDragging(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			onClick?.();
		}
	};

	const Icon = item.icon || TriggerIcon;

	return (
		<div
			className={cn(
				"flex cursor-grab flex-col items-center justify-center gap-1 rounded-lg p-3",
				"border border-dashed border-amber-500/30 transition-all duration-200",
				"hover:bg-amber-900/20 hover:border-amber-400/50 hover:shadow-md",
				isDragging && "cursor-grabbing opacity-50"
			)}
			draggable
			onClick={onClick}
			onDragEnd={handleDragEnd}
			onDragStart={handleDragStart}
			onKeyDown={handleKeyDown}
			role="button"
			tabIndex={0}
			title={item.label}
		>
			<IconSvg className="size-6 text-amber-400" src={Icon} />
			<span className="text-xs text-gray-400">{item.label}</span>
		</div>
	);
});

interface FileTreeSectionProps {
	isExpanded: boolean;
	onToggle: () => void;
	fileTree: TreeNode[];
	onDragStart: (event: DragEvent, item: DragItem) => void;
	onItemClick?: (item: DragItem) => void;
}

const FileTreeSection = memo(function FileTreeSection({
	isExpanded,
	onToggle,
	fileTree,
	onDragStart,
	onItemClick,
}: FileTreeSectionProps) {
	const fileCount = useMemo(() => {
		let count = 0;
		const countFiles = (nodes: TreeNode[]) => {
			nodes.forEach((node) => {
				if (!node.isFolder) count++;
				if (node.children) countFiles(node.children);
			});
		};
		countFiles(fileTree);
		return count;
	}, [fileTree]);

	return (
		<div className="mb-2">
			<button
				className={cn(
					"flex w-full items-center gap-2 px-4 py-2",
					"text-left text-sm font-medium text-gray-300",
					"transition-colors hover:bg-gray-800/50"
				)}
				onClick={onToggle}
				type="button"
			>
				<IconSvg className="size-4 text-blue-400" src={PythonIcon} />
				<IconSvg className="size-4 text-gray-500" src={isExpanded ? ChevronDownIcon : ChevronRightIcon} />
				<span>Files</span>
				<span className="ml-auto text-xs text-gray-600">{fileCount}</span>
			</button>

			{isExpanded ? (
				<div className="space-y-0.5 px-2 py-1">
					{fileTree.length > 0 ? (
						<FileTreeNodes nodes={fileTree} onDragStart={onDragStart} onItemClick={onItemClick} />
					) : (
						<p className="px-3 py-2 text-xs italic text-gray-500">No files available</p>
					)}
				</div>
			) : null}
		</div>
	);
});

interface FileTreeNodesProps {
	nodes: TreeNode[];
	depth?: number;
	onDragStart: (event: DragEvent, item: DragItem) => void;
	onItemClick?: (item: DragItem) => void;
}

const FileTreeNodes = memo(function FileTreeNodes({ nodes, depth = 0, onDragStart, onItemClick }: FileTreeNodesProps) {
	const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

	const toggleFolder = useCallback((path: string) => {
		setExpandedFolders((prev) => ({ ...prev, [path]: !prev[path] }));
	}, []);

	return (
		<>
			{nodes
				.filter((node) => node.name !== ".keep")
				.map((node) => {
					if (node.isFolder) {
						const isExpanded = expandedFolders[node.path] ?? true;
						return (
							<div key={node.path}>
								<button
									className={cn(
										"flex w-full items-center gap-1 rounded px-2 py-1",
										"text-left text-xs text-gray-400",
										"transition-colors hover:bg-gray-800/50"
									)}
									onClick={() => toggleFolder(node.path)}
									style={{ paddingLeft: `${depth * 12 + 8}px` }}
									type="button"
								>
									<IconSvg
										className="size-3 text-gray-500"
										src={isExpanded ? ChevronDownIcon : ChevronRightIcon}
									/>
									<span className="truncate">{node.name}/</span>
								</button>
								{isExpanded && node.children ? (
									<FileTreeNodes
										depth={depth + 1}
										nodes={node.children}
										onDragStart={onDragStart}
										onItemClick={onItemClick}
									/>
								) : null}
							</div>
						);
					}

					const fileItem: DragItem = {
						type: "file",
						label: node.name,
						icon: PythonIcon,
						data: {
							fileName: node.name,
							filePath: node.path,
						},
					};

					return (
						<FileTreeItem
							depth={depth}
							item={fileItem}
							key={node.path}
							node={node}
							onClick={() => onItemClick?.(fileItem)}
							onDragStart={onDragStart}
						/>
					);
				})}
		</>
	);
});

interface FileTreeItemProps {
	node: TreeNode;
	item: DragItem;
	depth: number;
	onDragStart: (event: DragEvent, item: DragItem) => void;
	onClick?: () => void;
}

const FileTreeItem = memo(function FileTreeItem({ node, item, depth, onDragStart, onClick }: FileTreeItemProps) {
	const [isDragging, setIsDragging] = useState(false);

	const handleDragStart = (event: DragEvent) => {
		setIsDragging(true);
		event.dataTransfer.setData("application/reactflow", JSON.stringify(item));
		event.dataTransfer.effectAllowed = "move";
		onDragStart(event, item);
	};

	const handleDragEnd = () => {
		setIsDragging(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			onClick?.();
		}
	};

	const isPythonFile = node.name.endsWith(".py");

	return (
		<div
			className={cn(
				"flex cursor-grab items-center gap-2 rounded px-2 py-1",
				"border border-transparent transition-all duration-200",
				"hover:bg-blue-900/20 hover:border-blue-500/30",
				isDragging && "cursor-grabbing opacity-50"
			)}
			draggable
			onClick={onClick}
			onDragEnd={handleDragEnd}
			onDragStart={handleDragStart}
			onKeyDown={handleKeyDown}
			role="button"
			style={{ paddingLeft: `${depth * 12 + 8}px` }}
			tabIndex={0}
			title={node.path}
		>
			<IconSvg
				className={cn("size-4 shrink-0", isPythonFile ? "text-blue-400" : "text-gray-400")}
				src={PythonIcon}
			/>
			<span className="truncate text-xs text-gray-300">{node.name}</span>
		</div>
	);
});

interface VariablesSectionProps {
	isExpanded: boolean;
	onToggle: () => void;
	items: DragItem[];
	onDragStart: (event: DragEvent, item: DragItem) => void;
	onItemClick?: (item: DragItem) => void;
}

const VariablesSection = memo(function VariablesSection({
	isExpanded,
	onToggle,
	items,
	onDragStart,
	onItemClick,
}: VariablesSectionProps) {
	return (
		<div className="mb-2">
			<button
				className={cn(
					"flex w-full items-center gap-2 px-4 py-2",
					"text-left text-sm font-medium text-gray-300",
					"transition-colors hover:bg-gray-800/50"
				)}
				onClick={onToggle}
				type="button"
			>
				<IconSvg className="size-4 text-purple-400" src={VariableIcon} />
				<IconSvg className="size-4 text-gray-500" src={isExpanded ? ChevronDownIcon : ChevronRightIcon} />
				<span>Variables</span>
				<span className="ml-auto text-xs text-gray-600">{items.length}</span>
			</button>

			{isExpanded ? (
				<div className="space-y-1 px-2 py-1">
					{items.length > 0 ? (
						items.map((item, index) => (
							<VariableItem
								item={item}
								key={`${item.label}-${index}`}
								onClick={() => onItemClick?.(item)}
								onDragStart={onDragStart}
							/>
						))
					) : (
						<p className="px-3 py-2 text-xs italic text-gray-500">No variables available</p>
					)}
				</div>
			) : null}
		</div>
	);
});

interface VariableItemProps {
	item: DragItem;
	onDragStart: (event: DragEvent, item: DragItem) => void;
	onClick?: () => void;
}

const VariableItem = memo(function VariableItem({ item, onDragStart, onClick }: VariableItemProps) {
	const [isDragging, setIsDragging] = useState(false);

	const handleDragStart = (event: DragEvent) => {
		setIsDragging(true);
		event.dataTransfer.setData("application/reactflow", JSON.stringify(item));
		event.dataTransfer.effectAllowed = "move";
		onDragStart(event, item);
	};

	const handleDragEnd = () => {
		setIsDragging(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			onClick?.();
		}
	};

	const isSecret = (item.data as { isSecret?: boolean })?.isSecret;

	return (
		<div
			className={cn(
				"flex cursor-grab items-center gap-3 rounded-lg px-3 py-2",
				"border border-dashed transition-all duration-200",
				"border-purple-500/30 hover:bg-purple-900/20 text-purple-400 hover:border-purple-400/50",
				"hover:shadow-md",
				isDragging && "cursor-grabbing opacity-50"
			)}
			draggable
			onClick={onClick}
			onDragEnd={handleDragEnd}
			onDragStart={handleDragStart}
			onKeyDown={handleKeyDown}
			role="button"
			tabIndex={0}
		>
			<IconSvg className="size-4 shrink-0" src={VariableIcon} />
			<span className="truncate text-sm text-gray-300">{item.label}</span>
			{isSecret ? <span className="text-purple-500 ml-auto text-10">secret</span> : null}
		</div>
	);
});

interface SidebarSectionComponentProps {
	section: SidebarSection;
	isExpanded: boolean;
	onToggle: () => void;
	onDragStart: (event: DragEvent, item: DragItem) => void;
	onItemClick?: (item: DragItem) => void;
}

const SidebarSectionComponent = memo(function SidebarSectionComponent({
	section,
	isExpanded,
	onToggle,
	onDragStart,
	onItemClick,
}: SidebarSectionComponentProps) {
	return (
		<div className="mb-2">
			<button
				className={cn(
					"flex w-full items-center gap-2 px-4 py-2",
					"text-left text-sm font-medium text-gray-300",
					"transition-colors hover:bg-gray-800/50"
				)}
				onClick={onToggle}
				type="button"
			>
				<IconSvg className="size-4 text-gray-500" src={isExpanded ? ChevronDownIcon : ChevronRightIcon} />
				<span>{section.title}</span>
				<span className="ml-auto text-xs text-gray-600">{section.items.length}</span>
			</button>

			{isExpanded ? (
				<div className="space-y-1 px-2 py-1">
					{section.items.map((item, index) => (
						<DraggableItem
							item={item}
							key={`${item.type}-${item.label}-${index}`}
							onClick={() => onItemClick?.(item)}
							onDragStart={onDragStart}
						/>
					))}

					{section.items.length === 0 ? (
						<p className="px-3 py-2 text-xs italic text-gray-500">No items available</p>
					) : null}
				</div>
			) : null}
		</div>
	);
});

interface DraggableItemProps {
	item: DragItem;
	onDragStart: (event: DragEvent, item: DragItem) => void;
	onClick?: () => void;
}

const DraggableItem = memo(function DraggableItem({ item, onDragStart, onClick }: DraggableItemProps) {
	const [isDragging, setIsDragging] = useState(false);

	const handleDragStart = (event: DragEvent) => {
		setIsDragging(true);
		event.dataTransfer.setData("application/reactflow", JSON.stringify(item));
		event.dataTransfer.effectAllowed = "move";
		onDragStart(event, item);
	};

	const handleDragEnd = () => {
		setIsDragging(false);
	};

	const getIcon = () => {
		if (item.icon) return item.icon;
		switch (item.type) {
			case "connection":
				return ConnectionIcon;
			case "file":
				return FileIcon;
			case "trigger":
				return TriggerIcon;
			case "variable":
				return VariableIcon;
			default:
				return FileIcon;
		}
	};

	const getTypeColor = () => {
		switch (item.type) {
			case "connection":
				return "text-emerald-400 border-emerald-500/30 hover:border-emerald-400/50 hover:bg-emerald-900/20";
			case "file":
				return "text-blue-400 border-blue-500/30 hover:border-blue-400/50 hover:bg-blue-900/20";
			case "trigger":
				return "text-amber-400 border-amber-500/30 hover:border-amber-400/50 hover:bg-amber-900/20";
			case "variable":
				return "text-purple-400 border-purple-500/30 hover:border-purple-400/50 hover:bg-purple-900/20";
			default:
				return "text-gray-400 border-gray-600 hover:border-gray-500";
		}
	};

	const Icon = getIcon();

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			onClick?.();
		}
	};

	return (
		<div
			className={cn(
				"flex cursor-grab items-center gap-3 rounded-lg px-3 py-2",
				"border border-dashed transition-all duration-200",
				getTypeColor(),
				isDragging && "cursor-grabbing opacity-50",
				"hover:shadow-md"
			)}
			draggable
			onClick={onClick}
			onDragEnd={handleDragEnd}
			onDragStart={handleDragStart}
			onKeyDown={handleKeyDown}
			role="button"
			tabIndex={0}
		>
			<IconSvg className="size-4 shrink-0" src={Icon} />
			<span className="truncate text-sm text-gray-300">{item.label}</span>
			<IconSvg
				className="ml-auto size-3 text-gray-600 opacity-0 transition-opacity group-hover:opacity-100"
				src={PlusIcon}
			/>
		</div>
	);
});

export const createDefaultSections = (
	connections: Array<{ connectionId: string; integrationId: string; name: string }>,
	files: string[],
	triggers: Array<{ name: string; triggerId: string }>,
	variables: Array<{ isSecret: boolean; name: string }>
): SidebarSection[] => {
	return [
		{
			title: "Connections",
			items: connections.map((conn) => ({
				type: "connection" as const,
				label: conn.name || conn.integrationId,
				data: {
					connectionId: conn.connectionId,
					name: conn.name,
					integrationId: conn.integrationId,
				},
			})),
		},
		{
			title: "Files",
			items: files.map((fileName) => ({
				type: "file" as const,
				label: fileName.split("/").pop() || fileName,
				data: {
					fileName: fileName.split("/").pop() || fileName,
					filePath: fileName,
				},
			})),
		},
		{
			title: "Triggers",
			items: triggers.map((trigger) => ({
				type: "trigger" as const,
				label: trigger.name || "Unnamed Trigger",
				data: {
					triggerId: trigger.triggerId,
					name: trigger.name,
				},
			})),
		},
		{
			title: "Variables",
			items: variables.map((variable) => ({
				type: "variable" as const,
				label: variable.name,
				data: {
					name: variable.name,
					isSecret: variable.isSecret,
				},
			})),
		},
	];
};

export default WorkflowSidebar;
