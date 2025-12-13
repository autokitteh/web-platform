// Icon Fallbacks
// This file provides fallback SVG components for icons that may not exist
// in the AutoKitteh codebase. Replace these with actual icons from your
// icon library or design system.
//
// The workflow canvas components reference these icons, so either:
// 1. Export matching icons from your existing @assets/image/icons
// 2. Use this file as a reference and create proper SVG icons
// 3. Import from an icon library like react-icons

import React from "react";

// Generic icon wrapper component
interface IconProps extends React.SVGProps<SVGSVGElement> {
	className?: string;
}

// Fallback icons - replace with your actual icons

export const ChevronDownIcon: React.FC<IconProps> = (props) => (
	<svg
		fill="none"
		stroke="currentColor"
		strokeLinecap="round"
		strokeLinejoin="round"
		strokeWidth="2"
		viewBox="0 0 24 24"
		{...props}
	>
		<polyline points="6 9 12 15 18 9" />
	</svg>
);

export const ChevronRightIcon: React.FC<IconProps> = (props) => (
	<svg
		fill="none"
		stroke="currentColor"
		strokeLinecap="round"
		strokeLinejoin="round"
		strokeWidth="2"
		viewBox="0 0 24 24"
		{...props}
	>
		<polyline points="9 18 15 12 9 6" />
	</svg>
);

export const PlusIcon: React.FC<IconProps> = (props) => (
	<svg
		fill="none"
		stroke="currentColor"
		strokeLinecap="round"
		strokeLinejoin="round"
		strokeWidth="2"
		viewBox="0 0 24 24"
		{...props}
	>
		<line x1="12" x2="12" y1="5" y2="19" />
		<line x1="5" x2="19" y1="12" y2="12" />
	</svg>
);

export const UndoIcon: React.FC<IconProps> = (props) => (
	<svg
		fill="none"
		stroke="currentColor"
		strokeLinecap="round"
		strokeLinejoin="round"
		strokeWidth="2"
		viewBox="0 0 24 24"
		{...props}
	>
		<path d="M3 7v6h6" />
		<path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
	</svg>
);

export const RedoIcon: React.FC<IconProps> = (props) => (
	<svg
		fill="none"
		stroke="currentColor"
		strokeLinecap="round"
		strokeLinejoin="round"
		strokeWidth="2"
		viewBox="0 0 24 24"
		{...props}
	>
		<path d="M21 7v6h-6" />
		<path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7" />
	</svg>
);

export const FitViewIcon: React.FC<IconProps> = (props) => (
	<svg
		fill="none"
		stroke="currentColor"
		strokeLinecap="round"
		strokeLinejoin="round"
		strokeWidth="2"
		viewBox="0 0 24 24"
		{...props}
	>
		<path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
	</svg>
);

export const SaveIcon: React.FC<IconProps> = (props) => (
	<svg
		fill="none"
		stroke="currentColor"
		strokeLinecap="round"
		strokeLinejoin="round"
		strokeWidth="2"
		viewBox="0 0 24 24"
		{...props}
	>
		<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
		<polyline points="17 21 17 13 7 13 7 21" />
		<polyline points="7 3 7 8 15 8" />
	</svg>
);

export const LayoutIcon: React.FC<IconProps> = (props) => (
	<svg
		fill="none"
		stroke="currentColor"
		strokeLinecap="round"
		strokeLinejoin="round"
		strokeWidth="2"
		viewBox="0 0 24 24"
		{...props}
	>
		<rect height="7" width="7" x="3" y="3" />
		<rect height="7" width="7" x="14" y="3" />
		<rect height="7" width="7" x="14" y="14" />
		<rect height="7" width="7" x="3" y="14" />
	</svg>
);

export const ConnectionIcon: React.FC<IconProps> = (props) => (
	<svg
		fill="none"
		stroke="currentColor"
		strokeLinecap="round"
		strokeLinejoin="round"
		strokeWidth="2"
		viewBox="0 0 24 24"
		{...props}
	>
		<path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
		<path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
	</svg>
);

export const FileIcon: React.FC<IconProps> = (props) => (
	<svg
		fill="none"
		stroke="currentColor"
		strokeLinecap="round"
		strokeLinejoin="round"
		strokeWidth="2"
		viewBox="0 0 24 24"
		{...props}
	>
		<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
		<polyline points="14 2 14 8 20 8" />
		<line x1="16" x2="8" y1="13" y2="13" />
		<line x1="16" x2="8" y1="17" y2="17" />
		<polyline points="10 9 9 9 8 9" />
	</svg>
);

export const TriggerIcon: React.FC<IconProps> = (props) => (
	<svg
		fill="none"
		stroke="currentColor"
		strokeLinecap="round"
		strokeLinejoin="round"
		strokeWidth="2"
		viewBox="0 0 24 24"
		{...props}
	>
		<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
	</svg>
);

export const VariableIcon: React.FC<IconProps> = (props) => (
	<svg
		fill="none"
		stroke="currentColor"
		strokeLinecap="round"
		strokeLinejoin="round"
		strokeWidth="2"
		viewBox="0 0 24 24"
		{...props}
	>
		<polyline points="16 18 22 12 16 6" />
		<polyline points="8 6 2 12 8 18" />
		<line transform="rotate(15 12 12)" x1="12" x2="12" y1="2" y2="22" />
	</svg>
);

export const LockIcon: React.FC<IconProps> = (props) => (
	<svg
		fill="none"
		stroke="currentColor"
		strokeLinecap="round"
		strokeLinejoin="round"
		strokeWidth="2"
		viewBox="0 0 24 24"
		{...props}
	>
		<rect height="11" rx="2" ry="2" width="18" x="3" y="11" />
		<path d="M7 11V7a5 5 0 0110 0v4" />
	</svg>
);

export const WebhookIcon: React.FC<IconProps> = (props) => (
	<svg
		fill="none"
		stroke="currentColor"
		strokeLinecap="round"
		strokeLinejoin="round"
		strokeWidth="2"
		viewBox="0 0 24 24"
		{...props}
	>
		<path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 012 17c.01-.7.2-1.4.57-2" />
		<path d="M6 17a4 4 0 004-4V9a4 4 0 00-4-4" />
		<path d="M8 9H5.17c-1.63 0-3.31.79-3.31 3.5 0 1.05.32 2.01.85 2.79" />
		<path d="M13 5.58c.28-.9.85-1.68 1.6-2.24a4 4 0 015.54 5.69l-1.7 2.02" />
		<path d="M10 12v-1c0-1.48.5-2.86 1.34-3.96" />
		<circle cx="10" cy="14" r="2" />
		<circle cx="18" cy="17" r="2" />
	</svg>
);

export const ScheduleIcon: React.FC<IconProps> = (props) => (
	<svg
		fill="none"
		stroke="currentColor"
		strokeLinecap="round"
		strokeLinejoin="round"
		strokeWidth="2"
		viewBox="0 0 24 24"
		{...props}
	>
		<circle cx="12" cy="12" r="10" />
		<polyline points="12 6 12 12 16 14" />
	</svg>
);

export const PythonIcon: React.FC<IconProps> = (props) => (
	<svg fill="currentColor" viewBox="0 0 24 24" {...props}>
		<path d="M11.914 0C5.82 0 6.2 2.656 6.2 2.656l.007 2.752h5.814v.826H3.9S0 5.789 0 11.969c0 6.18 3.403 5.96 3.403 5.96h2.03v-2.867s-.109-3.402 3.35-3.402h5.77s3.24.052 3.24-3.13V3.202S18.28 0 11.914 0zM8.708 1.85c.578 0 1.047.47 1.047 1.047 0 .578-.47 1.047-1.047 1.047-.578 0-1.047-.47-1.047-1.047 0-.578.47-1.047 1.047-1.047z" />
		<path d="M12.086 24c6.094 0 5.714-2.656 5.714-2.656l-.007-2.752h-5.814v-.826h8.121s3.9.445 3.9-5.734c0-6.18-3.403-5.96-3.403-5.96h-2.03v2.867s.109 3.402-3.35 3.402h-5.77s-3.24-.052-3.24 3.13v5.328S5.72 24 12.086 24zm3.206-1.85c-.578 0-1.047-.47-1.047-1.047 0-.578.47-1.047 1.047-1.047.578 0 1.047.47 1.047 1.047 0 .578-.47 1.047-1.047 1.047z" />
	</svg>
);

export const JavaScriptIcon: React.FC<IconProps> = (props) => (
	<svg fill="currentColor" viewBox="0 0 24 24" {...props}>
		<path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" />
	</svg>
);

export const TypeScriptIcon: React.FC<IconProps> = (props) => (
	<svg fill="currentColor" viewBox="0 0 24 24" {...props}>
		<path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" />
	</svg>
);

export const YamlIcon: React.FC<IconProps> = (props) => (
	<svg fill="currentColor" viewBox="0 0 24 24" {...props}>
		<path d="M12.89 3l.94.95-7.26 7.21 7.26 7.25-.94.95-8.21-8.2 8.21-8.16M19.05 12l-8.21 8.2-.94-.95 7.26-7.25-7.26-7.21.94-.95 8.21 8.16z" />
	</svg>
);

// Export all icons as a map for dynamic usage
export const iconMap = {
	chevronDown: ChevronDownIcon,
	chevronRight: ChevronRightIcon,
	plus: PlusIcon,
	undo: UndoIcon,
	redo: RedoIcon,
	fitView: FitViewIcon,
	save: SaveIcon,
	layout: LayoutIcon,
	connection: ConnectionIcon,
	file: FileIcon,
	trigger: TriggerIcon,
	variable: VariableIcon,
	lock: LockIcon,
	webhook: WebhookIcon,
	schedule: ScheduleIcon,
	python: PythonIcon,
	javascript: JavaScriptIcon,
	typescript: TypeScriptIcon,
	yaml: YamlIcon,
};
