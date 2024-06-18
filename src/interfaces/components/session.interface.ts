import { Session, SessionStateKeyType } from "@type/models";

export interface SessionTableFilterProps {
	onChange: (sessionState?: SessionStateKeyType) => void;
}

export interface SessionsTableRowProps {
	sessions: Session[];
	selectedSessionId?: string;
	openSessionLog: (sessionId: string) => void;
	showDeleteModal: () => void;
}
