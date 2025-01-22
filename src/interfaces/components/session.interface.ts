import { ListOnItemsRenderedProps } from "react-window";

import { SessionStateType } from "@src/enums";
import { Session, SessionStateKeyType } from "@src/interfaces/models";
import { DeploymentSession } from "@type/models";

export interface SessionTableFilterProps {
	onChange: (sessionState?: SessionStateKeyType) => void;
	sessionStats: DeploymentSession[];
	defaultValue?: SessionStateKeyType;
	selectedState?: SessionStateType;
}

export interface SessionsTableRowProps {
	openSessionLog: (sessionId: string) => void;
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
