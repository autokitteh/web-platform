import { ListOnItemsRenderedProps } from "react-window";

import { SessionStateType } from "@src/enums";
import { Session, SessionStateKeyType } from "@src/interfaces/models";
import { SessionStatsFilterType } from "@src/types/components";

export interface SessionTableFilterProps {
	onChange: (sessionState?: SessionStateKeyType | null) => void;
	filtersData: SessionStatsFilterType;
	defaultValue?: SessionStateKeyType;
	selectedState?: SessionStateType;
	isCompactMode?: boolean;
}

export interface SessionsTableRowProps {
	openSession: (sessionId: string) => void;
	selectedSessionId?: string;
	sessions: Session[];
	showDeleteModal: (id: string) => void;
	onSessionRemoved: () => void;
	hideSourceColumn?: boolean;
	hideActionsColumn?: boolean;
}

export interface SessionsTableListRef {
	scrollToTop: () => void;
}

export interface SessionsTableListProps {
	onItemsRendered: (props: ListOnItemsRenderedProps) => void;
	onSelectedSessionId: (id: string) => void;
	onSessionRemoved: () => void;
	onScrollPositionChange?: (isAtTop: boolean) => void;
	sessions: Session[];
	openSession: (sessionId: string) => void;
	hideSourceColumn?: boolean;
	hideActionsColumn?: boolean;
	listRef?: React.MutableRefObject<SessionsTableListRef | null>;
}
