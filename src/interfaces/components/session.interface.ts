import { ListOnItemsRenderedProps, ListOnScrollProps } from "react-window";

import { DeploymentSession, Session, SessionStateKeyType } from "@type/models";

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
	onUpdateSessions: () => void;
}

export interface SessionsTableListProps {
	onItemsRendered: (props: ListOnItemsRenderedProps) => void;
	onScroll: (props: ListOnScrollProps) => void;
	onSelectedSessionId: (id: string) => void;
	onUpdateSessions: () => void;
	sessions: Session[];
}
