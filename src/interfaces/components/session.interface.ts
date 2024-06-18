import { Session, SessionStateKeyType } from "@type/models";
import { ListOnItemsRenderedProps } from "react-window";

export interface SessionTableFilterProps {
	onChange: (sessionState?: SessionStateKeyType) => void;
}

export interface SessionsTableRowProps {
	sessions: Session[];
	selectedSessionId?: string;
	openSessionLog: (sessionId: string) => void;
	showDeleteModal: () => void;
}

export interface SessionsTableListProps {
	sessions: Session[];
	frameRef: React.RefObject<HTMLDivElement>;
	onItemsRendered: (props: ListOnItemsRenderedProps) => void;
}
