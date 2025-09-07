import { OperationType } from "@type/global";

export interface CodeFixDiffEditorProps {
	name: string;
	originalCode: string;
	modifiedCode: string;
	onApprove: () => void;
	onReject: () => void;
	filename?: string;
	startLine?: number;
	endLine?: number;
	changeType?: OperationType;
}
