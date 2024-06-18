import { Session, SessionStateKeyType } from "@type/models";
import { ListOnItemsRenderedProps, ListOnScrollProps } from "react-window";

export interface SessionTableFilterProps {
	onChange: (sessionState?: SessionStateKeyType) => void;
}

export interface SessionsTableRowProps {
	scrollDisplayed: boolean;
	sessions: Session[];
	selectedSessionId?: string;
	openSessionLog: (sessionId: string) => void;
	showDeleteModal: () => void;
}

export interface SessionsTableListProps {
	sessions: Session[];
	onItemsRendered: (props: ListOnItemsRenderedProps) => void;
	onScroll: (props: ListOnScrollProps) => void;
}
