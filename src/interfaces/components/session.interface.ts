import { SessionLogRecord } from "@models";
import { SessionStateKeyType } from "@type/models";

export interface SessionTableFilterProps {
	onChange: (sessionState?: SessionStateKeyType) => void;
}

export interface SessionTableEditorProps {
	sessionLog?: SessionLogRecord[];
	isSelectedSession: boolean;
	onClose: () => void;
}
