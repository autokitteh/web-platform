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
