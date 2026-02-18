export interface ParsedEntryPoint {
	name: string;
	lineNumber: number;
	parameters: string[];
	isAsync: boolean;
	decorators: string[];
	isActive: boolean;
}

export interface ParseResult {
	entryPoints: ParsedEntryPoint[];
	imports: string[];
	connectionReferences: string[];
}

const PYTHON_FUNCTION_PATTERN = /^(\s*)(?:(async)\s+)?def\s+(\w+)\s*\((.*?)\)\s*(?:->.*?)?:/gm;
const IMPORT_PATTERN = /^(?:from\s+[\w.]+\s+)?import\s+(.+)$/gm;
const CONNECTION_GET_PATTERN = /(?:ak\.get_connection|autokitteh\.\w+\.connection)\s*\(\s*["']([^"']+)["']\s*\)/g;

export function parseEntryPoints(content: string, _language: "python" | "starlark" = "python"): ParsedEntryPoint[] {
	void _language;
	const entryPoints: ParsedEntryPoint[] = [];
	const lines = content.split("\n");
	const decoratorsByLine: Map<number, string[]> = new Map();

	lines.forEach((line, index) => {
		const decoratorMatch = line.match(/^\s*@(\w+(?:\.\w+)*(?:\([^)]*\))?)/);
		if (decoratorMatch) {
			const lineNum = index + 1;
			const existing = decoratorsByLine.get(lineNum) || [];
			existing.push(decoratorMatch[1]);
			decoratorsByLine.set(lineNum, existing);
		}
	});

	let match;
	PYTHON_FUNCTION_PATTERN.lastIndex = 0;

	while ((match = PYTHON_FUNCTION_PATTERN.exec(content)) !== null) {
		const [, indent, asyncKeyword, funcName, params] = match;

		if (indent && indent.length > 0) {
			continue;
		}

		const lineNumber = content.substring(0, match.index).split("\n").length;

		const decorators: string[] = [];
		for (let i = lineNumber - 1; i >= 1; i--) {
			const lineDecorators = decoratorsByLine.get(i);
			if (lineDecorators) {
				decorators.unshift(...lineDecorators);
			} else {
				const prevLine = lines[i - 1]?.trim();
				if (prevLine && !prevLine.startsWith("@") && prevLine !== "") {
					break;
				}
			}
		}

		const parameters = parseParameters(params);

		const isActive =
			decorators.some(
				(d) =>
					d.startsWith("autokitteh") ||
					d.startsWith("ak.") ||
					d === "handler" ||
					d.includes("handler") ||
					d.includes("entry") ||
					d.includes("subscribe")
			) || funcName.startsWith("on_");

		entryPoints.push({
			name: funcName,
			lineNumber,
			parameters,
			isAsync: !!asyncKeyword,
			decorators,
			isActive,
		});
	}

	return entryPoints;
}

function parseParameters(paramsString: string): string[] {
	if (!paramsString.trim()) {
		return [];
	}

	const params: string[] = [];
	let current = "";
	let depth = 0;

	for (const char of paramsString) {
		if (char === "(" || char === "[" || char === "{") {
			depth++;
			current += char;
		} else if (char === ")" || char === "]" || char === "}") {
			depth--;
			current += char;
		} else if (char === "," && depth === 0) {
			const param = extractParamName(current.trim());
			if (param && param !== "self" && param !== "cls") {
				params.push(param);
			}
			current = "";
		} else {
			current += char;
		}
	}

	if (current.trim()) {
		const param = extractParamName(current.trim());
		if (param && param !== "self" && param !== "cls") {
			params.push(param);
		}
	}

	return params;
}

function extractParamName(param: string): string {
	const colonIndex = param.indexOf(":");
	const equalsIndex = param.indexOf("=");

	let name = param;
	if (colonIndex !== -1) {
		name = param.substring(0, colonIndex);
	} else if (equalsIndex !== -1) {
		name = param.substring(0, equalsIndex);
	}

	return name.trim().replace(/^\*+/, "");
}

export function parseImports(content: string): string[] {
	const imports: string[] = [];
	let match;

	IMPORT_PATTERN.lastIndex = 0;

	while ((match = IMPORT_PATTERN.exec(content)) !== null) {
		const importPart = match[1];
		const items = importPart.split(",").map((item) => item.trim().split(" as ")[0].trim());
		imports.push(...items);
	}

	return imports;
}

export function parseConnectionReferences(content: string): string[] {
	const connections: Set<string> = new Set();

	let match;
	CONNECTION_GET_PATTERN.lastIndex = 0;
	while ((match = CONNECTION_GET_PATTERN.exec(content)) !== null) {
		connections.add(match[1]);
	}

	return Array.from(connections);
}

export function parseCode(content: string, language: "python" | "starlark" = "python"): ParseResult {
	return {
		entryPoints: parseEntryPoints(content, language),
		imports: parseImports(content),
		connectionReferences: parseConnectionReferences(content),
	};
}

export function findEntryPointByName(entryPoints: ParsedEntryPoint[], name: string): ParsedEntryPoint | undefined {
	return entryPoints.find((ep) => ep.name === name);
}

export function getActiveEntryPoints(entryPoints: ParsedEntryPoint[]): ParsedEntryPoint[] {
	return entryPoints.filter((ep) => ep.isActive);
}

export function extractFunctionNameFromCall(call: string): { fileName: string; functionName: string } | null {
	if (!call) {
		return null;
	}

	const parts = call.split(":");
	if (parts.length !== 2) {
		return null;
	}

	return {
		fileName: parts[0],
		functionName: parts[1],
	};
}

export function formatEntryPointCall(fileName: string, functionName: string): string {
	return `${fileName}:${functionName}`;
}
