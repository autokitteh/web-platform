export interface CodeFixDiffEditorProps {
	isOpen: boolean;
	onClose: () => void;
	originalCode: string;
	modifiedCode: string;
	onApprove: () => void;
	onReject: () => void;
	filename?: string;
	startLine?: number;
	endLine?: number;
}
