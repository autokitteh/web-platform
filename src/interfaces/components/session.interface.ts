import { ListOnItemsRenderedProps } from "react-window";

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
	onSessionRemoved: () => void;
}

export interface SessionsTableListProps {
	onItemsRendered: (props: ListOnItemsRenderedProps) => void;
	onSelectedSessionId: (id: string) => void;
	onSessionRemoved: () => void;
	sessions: Session[];
}
