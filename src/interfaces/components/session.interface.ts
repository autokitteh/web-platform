import { DeploymentSession, Session, SessionStateKeyType } from "@type/models";
import { ListOnItemsRenderedProps, ListOnScrollProps } from "react-window";

export interface SessionTableFilterProps {
	onChange: (sessionState?: SessionStateKeyType) => void;
	sessionStats: DeploymentSession[];
}

export interface SessionsTableRowProps {
	openSessionLog: (sessionId: string) => void;
	scrollDisplayed: boolean;
	selectedSessionId?: string;
	sessions: Session[];
	showDeleteModal: (id: string) => void;
}

export interface SessionsTableListProps {
	onItemsRendered: (props: ListOnItemsRenderedProps) => void;
	onScroll: (props: ListOnScrollProps) => void;
	onSelectedSessionId: (id: string) => void;
	sessions: Session[];
}
