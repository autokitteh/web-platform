export interface CodeFixDiffEditorProps {
	name: string;
	originalCode: string;
	modifiedCode: string;
	onApprove: () => void;
	onReject: () => void;
	filename?: string;
	startLine?: number;
	endLine?: number;
	changeType?: "modify" | "add" | "delete";
}
