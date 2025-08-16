export interface CodeFixDiffEditorProps {
	name: string;
	originalCode: string;
	modifiedCode: string;
	closeModal: () => void;
	onApprove: () => void;
	onReject: () => void;
	filename?: string;
	startLine?: number;
	endLine?: number;
}
