export interface CodeFixDiffEditorProps {
	name: string;
	originalCode: string;
	modifiedCode: string;
	onApprove: () => void;
	onReject: () => void;
	onClose: () => void;
	filename?: string;
	startLine?: number;
	endLine?: number;
}
