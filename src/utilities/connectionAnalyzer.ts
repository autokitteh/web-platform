export type OperationType = "read" | "write";

export interface ConnectionOperation {
	type: OperationType;
	functionName: string;
	lineNumber: number;
	method?: string;
}

export interface ConnectionUsage {
	connectionName: string;
	functions: string[];
	operations: ConnectionOperation[];
	variableName?: string;
}

export interface FileConnectionUsage {
	filePath: string;
	usages: ConnectionUsage[];
}

const CONNECTION_PATTERNS = {
	akGetConnection: /(?:ak|autokitteh)\.get_connection\s*\(\s*["']([^"']+)["']\s*\)/g,
	integrationConnection: /autokitteh\.(\w+)\.connection\s*\(\s*["']([^"']+)["']\s*\)/g,
	directReference: /(\w+)\s*=\s*(?:ak|autokitteh)\.get_connection\s*\(\s*["']([^"']+)["']\s*\)/g,
};

const WRITE_METHODS = [
	"send",
	"post",
	"create",
	"update",
	"delete",
	"write",
	"put",
	"patch",
	"insert",
	"add",
	"set",
	"upload",
	"push",
	"save",
	"remove",
	"chat_postMessage",
	"chat_update",
	"create_issue",
	"update_issue",
	"send_message",
];

const READ_METHODS = [
	"get",
	"fetch",
	"read",
	"list",
	"query",
	"search",
	"find",
	"retrieve",
	"download",
	"conversations_list",
	"users_list",
	"get_issue",
	"list_issues",
	"get_message",
];

export function analyzeConnectionUsage(content: string, connectionNames: string[]): ConnectionUsage[] {
	const usages: Map<string, ConnectionUsage> = new Map();
	const lines = content.split("\n");
	const connectionVariables: Map<string, string> = new Map();

	extractConnectionVariables(content, connectionVariables);

	connectionNames.forEach((connName) => {
		usages.set(connName, {
			connectionName: connName,
			functions: [],
			operations: [],
		});
	});

	const functionRanges = extractFunctionRanges(lines);

	lines.forEach((line, index) => {
		const lineNumber = index + 1;
		const currentFunction = findContainingFunction(lineNumber, functionRanges);

		connectionNames.forEach((connName) => {
			if (line.includes(`"${connName}"`) || line.includes(`'${connName}'`)) {
				const usage = usages.get(connName)!;
				if (currentFunction && !usage.functions.includes(currentFunction)) {
					usage.functions.push(currentFunction);
				}
			}
		});

		connectionVariables.forEach((connName, varName) => {
			if (line.includes(varName) && !line.includes(`${varName} =`) && !line.includes(`${varName}=`)) {
				const usage = usages.get(connName);
				if (usage) {
					usage.variableName = varName;
					if (currentFunction && !usage.functions.includes(currentFunction)) {
						usage.functions.push(currentFunction);
					}

					const operation = detectOperation(line, varName, currentFunction || "unknown", lineNumber);
					if (operation) {
						usage.operations.push(operation);
					}
				}
			}
		});
	});

	return Array.from(usages.values()).filter((usage) => usage.functions.length > 0 || usage.operations.length > 0);
}

function extractConnectionVariables(content: string, connectionVariables: Map<string, string>): void {
	let match;

	CONNECTION_PATTERNS.directReference.lastIndex = 0;
	while ((match = CONNECTION_PATTERNS.directReference.exec(content)) !== null) {
		connectionVariables.set(match[1], match[2]);
	}

	const integrationPattern = /(\w+)\s*=\s*autokitteh\.(\w+)\.connection\s*\(\s*["']([^"']+)["']\s*\)/g;
	while ((match = integrationPattern.exec(content)) !== null) {
		connectionVariables.set(match[1], match[3]);
	}
}

interface FunctionRange {
	name: string;
	startLine: number;
	endLine: number;
	indentLevel: number;
}

function extractFunctionRanges(lines: string[]): FunctionRange[] {
	const ranges: FunctionRange[] = [];
	const functionPattern = /^(\s*)(?:async\s+)?def\s+(\w+)\s*\(/;

	for (let i = 0; i < lines.length; i++) {
		const match = lines[i].match(functionPattern);
		if (match) {
			const indentLevel = match[1].length;
			const funcName = match[2];
			const startLine = i + 1;

			let endLine = lines.length;
			for (let j = i + 1; j < lines.length; j++) {
				const nextLine = lines[j];
				if (nextLine.trim() === "") {
					continue;
				}

				const nextIndent = nextLine.match(/^(\s*)/)?.[1].length || 0;
				if (nextIndent <= indentLevel && nextLine.trim() !== "") {
					const isDecorator = nextLine.trim().startsWith("@");
					const isNextFunction = functionPattern.test(nextLine);

					if (isDecorator || isNextFunction) {
						endLine = j;
						break;
					}
				}
			}

			ranges.push({
				name: funcName,
				startLine,
				endLine,
				indentLevel,
			});
		}
	}

	return ranges;
}

function findContainingFunction(lineNumber: number, ranges: FunctionRange[]): string | null {
	for (const range of ranges) {
		if (lineNumber >= range.startLine && lineNumber <= range.endLine) {
			return range.name;
		}
	}

	return null;
}

function detectOperation(
	line: string,
	varName: string,
	functionName: string,
	lineNumber: number
): ConnectionOperation | null {
	const methodCallPattern = new RegExp(`${varName}\\.(\\w+)\\s*\\(`);
	const match = line.match(methodCallPattern);

	if (match) {
		const method = match[1];
		const type = determineOperationType(method);

		return {
			type,
			functionName,
			lineNumber,
			method,
		};
	}

	return null;
}

function determineOperationType(method: string): OperationType {
	const lowerMethod = method.toLowerCase();

	if (WRITE_METHODS.some((wm) => lowerMethod.includes(wm))) {
		return "write";
	}

	if (READ_METHODS.some((rm) => lowerMethod.includes(rm))) {
		return "read";
	}

	return "read";
}

export function getConnectionsUsedByFunction(usages: ConnectionUsage[], functionName: string): string[] {
	return usages.filter((usage) => usage.functions.includes(functionName)).map((usage) => usage.connectionName);
}

export function getFunctionsUsingConnection(usages: ConnectionUsage[], connectionName: string): string[] {
	const usage = usages.find((u) => u.connectionName === connectionName);

	return usage?.functions || [];
}

export function getOperationsByConnection(usages: ConnectionUsage[], connectionName: string): ConnectionOperation[] {
	const usage = usages.find((u) => u.connectionName === connectionName);

	return usage?.operations || [];
}

export function summarizeConnectionUsage(usages: ConnectionUsage[]): {
	readOperations: number;
	totalConnections: number;
	totalOperations: number;
	unusedConnections: string[];
	writeOperations: number;
} {
	let totalOperations = 0;
	let readOperations = 0;
	let writeOperations = 0;
	const unusedConnections: string[] = [];

	usages.forEach((usage) => {
		if (usage.functions.length === 0 && usage.operations.length === 0) {
			unusedConnections.push(usage.connectionName);
		}

		usage.operations.forEach((op) => {
			totalOperations++;
			if (op.type === "read") {
				readOperations++;
			} else {
				writeOperations++;
			}
		});
	});

	return {
		totalConnections: usages.length,
		totalOperations,
		readOperations,
		writeOperations,
		unusedConnections,
	};
}

export function analyzeMultipleFiles(
	files: { content: string; path: string }[],
	connectionNames: string[]
): FileConnectionUsage[] {
	return files.map((file) => ({
		filePath: file.path,
		usages: analyzeConnectionUsage(file.content, connectionNames),
	}));
}

export function aggregateUsagesByConnection(
	fileUsages: FileConnectionUsage[]
): Map<string, { files: string[]; totalOperations: number }> {
	const aggregated = new Map<string, { files: string[]; totalOperations: number }>();

	fileUsages.forEach((fileUsage) => {
		fileUsage.usages.forEach((usage) => {
			const existing = aggregated.get(usage.connectionName) || { files: [], totalOperations: 0 };
			if (!existing.files.includes(fileUsage.filePath)) {
				existing.files.push(fileUsage.filePath);
			}
			existing.totalOperations += usage.operations.length;
			aggregated.set(usage.connectionName, existing);
		});
	});

	return aggregated;
}
