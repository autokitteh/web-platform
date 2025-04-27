import { ListOnItemsRenderedProps } from "react-window";

import { SessionStateType } from "@enums";
import { Session, SessionStateKeyType } from "@interfaces/models";
import { SessionStatsFilterType } from "@type/components";

export interface SessionTableFilterProps {
	onChange: (sessionState?: SessionStateKeyType | null) => void;
	filtersData: SessionStatsFilterType;
	defaultValue?: SessionStateKeyType;
	selectedState?: SessionStateType;
}

export interface SessionsTableRowProps {
	openSession: (sessionId: string) => void;
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
	openSession: (sessionId: string) => void;
}
