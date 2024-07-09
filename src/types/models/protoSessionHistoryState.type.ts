import { SessionState_Completed, SessionState_Created, SessionState_Error, SessionState_Running } from "@ak-proto-ts/sessions/v1/session_pb";

export type ProtoSessionHistoryState = SessionState_Completed | SessionState_Created | SessionState_Error | SessionState_Running;
