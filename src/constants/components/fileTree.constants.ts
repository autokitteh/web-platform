import { IconType } from "react-icons";
import {
	SiCss3,
	SiHtml5,
	SiJavascript,
	SiJson,
	SiMarkdown,
	SiPython,
	SiReact,
	SiTypescript,
	SiYaml,
} from "react-icons/si";
import { VscFile, VscFolder, VscFolderOpened } from "react-icons/vsc";

export const fileIconMap: Record<string, { color: string; icon: IconType }> = {
	css: { color: "#1572B6", icon: SiCss3 },
	html: { color: "#E34F26", icon: SiHtml5 },
	js: { color: "#F7DF1E", icon: SiJavascript },
	json: { color: "#000000", icon: SiJson },
	jsx: { color: "#61DAFB", icon: SiReact },
	md: { color: "#083fa1", icon: SiMarkdown },
	py: { color: "#3776AB", icon: SiPython },
	ts: { color: "#3178C6", icon: SiTypescript },
	tsx: { color: "#3178C6", icon: SiReact },
	yaml: { color: "#CB171E", icon: SiYaml },
	yml: { color: "#CB171E", icon: SiYaml },
};

export const defaultFileIcon = { color: "#6bc7f6", icon: VscFile };
export const folderIcons = {
	closed: { color: "#f6cf60", icon: VscFolder },
	open: { color: "#f6cf60", icon: VscFolderOpened },
};

export const getFileIcon = (fileName: string): { color: string; icon: IconType } => {
	const extension = fileName.split(".").pop()?.toLowerCase();
	return extension && fileIconMap[extension] ? fileIconMap[extension] : defaultFileIcon;
};

export const fileTreeColors = {
	action: {
		default: "#898989",
		delete: "#FF6B61",
		hover: "#BCF870",
	},
	active: {
		text: "#BCF870",
	},
	caret: {
		default: "#898989",
		hover: "#BCF870",
	},
	hover: {
		background: "#1b1b1b",
	},
	selected: {
		background: "#2d2d2d",
		text: "#BCF870",
	},
};

export const fileTreeClasses = {
	container: "flex gap-2 py-2",
	mainButton: "group mr-4 !p-0 hover:bg-transparent hover:font-semibold",
	createIcon: "size-4 stroke-green-800 stroke-[2] transition-all group-hover:stroke-[3]",
	createText: "-ml-1 text-sm text-green-800 hover:underline",
	dropdown: "w-full justify-start text-left hover:bg-gray-1250",
	createButton: "w-full justify-start text-left hover:bg-gray-1250",
	importLabel: "group flex w-full cursor-pointer items-center gap-2 !p-0",
	uploadIcon: "size-4 stroke-green-800 stroke-[4] transition-all",
	importText: "text-sm text-green-800",
	emptyStateContainer: "-ml-0.5 mt-1.5 flex gap-1.5",
	emptyStateText: "text-sm text-gray-300",
	searchContainer: "mb-3",
	searchInput:
		"w-full rounded-lg border border-gray-800 bg-gray-1100 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-green-800 focus:outline-none",
	nodeContainer: "group flex w-full items-center justify-between rounded-lg px-2 py-0 transition-all duration-200",
	nodeContainerSelected: "bg-gray-1100",
	nodeContainerHover: "hover:bg-gray-1250",
	nodeContent: "flex min-w-0 flex-1 items-center gap-1 cursor-pointer",
	caretIcon: "size-4 shrink-0 transition-transform duration-200 fill-gray-700 group-hover:fill-green-800",
	caretOpen: "rotate-0",
	caretClosed: "-rotate-90",
	caretPlaceholder: "size-4 shrink-0",
	folderIcon: "size-4 shrink-0 fill-yellow-500",
	fileIcon: "size-4 shrink-0 stroke-blue-500",
	nodeName: "text-sm truncate min-w-0 flex-1",
	nodeNameActive: "text-white",
	nodeNameInactive: "text-gray-400",
	nodeNameEditing: "text-white",
	editInput:
		"w-full rounded border border-green-800 bg-gray-1100 px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-green-800",
	actionsContainer: "flex gap-1 opacity-0 transition-all group-hover:opacity-100",
	actionButton:
		"flex size-6 shrink-0 cursor-pointer items-center justify-center rounded hover:bg-gray-1250 transition-colors",
	editIcon: "size-4 fill-gray-400 hover:fill-blue-500",
	deleteIcon: "size-4 stroke-gray-400 hover:stroke-red-500",
	keyboardHint: "mt-2 text-xs text-gray-600",
};
