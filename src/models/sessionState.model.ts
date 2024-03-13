import { SessionLogRecord as ProtoSessionLogRecord } from "@ak-proto-ts/sessions/v1/session_pb";
import { Value } from "@ak-proto-ts/values/v1/values_pb";
import { SessionStateType } from "@enums";
import { LoggerService } from "@services";
import { Callstack } from "@type/models";
import { convertTimestampToDate } from "@utilities";
import i18n from "i18next";

export class SessionState {
	type: SessionStateType = SessionStateType.unknown;
	callstackTrace: Callstack[] = [];
	logs?: string[];
	error?: string;
	call?: object;
	dateTime?: Date;

	constructor(session: ProtoSessionLogRecord) {
		const stateTypeMapping: Record<string, SessionStateType> = {
			callSpec: SessionStateType.callSpec,
			callAttemptComplete: SessionStateType.callAttemptComplete,
			callAttemptStart: SessionStateType.callAttemptStart,
			error: SessionStateType.error,
			print: SessionStateType.print,
		};

		const state = session.state ?? session;

		if (!session) {
			LoggerService.error(
				"SessionState",
				i18n.t("errors.unexpectedSessionStateType", { error: "Session doesn't exist" })
			);
			return;
		}

		const sessionState = Object.keys(stateTypeMapping).find((key) => key in state) ?? Object.keys(state)[0];

		const unhandledSessionStates = ["created", "running", "error", "completed"];

		switch (sessionState) {
			case SessionStateType.callAttemptStart:
				this.type = SessionStateType.callAttemptStart;
				this.dateTime = convertTimestampToDate(session[SessionStateType.callAttemptStart]?.startedAt);
				break;
			case SessionStateType.callAttemptComplete:
				this.handleCallAttemptComplete(session);
				break;
			case SessionStateType.callSpec:
				this.handleFuncCall(session);
				break;
			case SessionStateType.print:
				this.type = SessionStateType.print;
				this.logs = [`${i18n.t("sessions.historyPrint")}: ${session.print}`];
				break;
			default:
				if (!unhandledSessionStates.includes(sessionState)) {
					throw new Error(
						i18n.t("errors.unexpectedSessionStateType", { error: "Session history state type doesn't exist" })
					);
				}
				this.handleDefaultCase(session);
		}

		if (this.dateTime === undefined) {
			this.setDateTime(session);
		}
		this.setErrorAndCallstack(session);
	}

	private handleDefaultCase(session: ProtoSessionLogRecord) {
		const stateCase = Object.keys(session.state || {})[0] as SessionStateType;
		if (!stateCase || !(stateCase in SessionStateType)) {
			this.type = SessionStateType.unknown;
		} else if (stateCase) {
			this.type = stateCase as SessionStateType;
			this.logs = session.print ? [session.print.text] : [];
		}
	}

	private handleCallAttemptComplete(session: ProtoSessionLogRecord) {
		this.type = SessionStateType.callAttemptComplete;
		let functionResponse = session[this.type]?.result?.value?.struct?.fields?.body?.string?.v || "";
		const functionName = session[this.type]?.result?.value?.struct?.ctor?.string?.v || "";
		if (functionName === "time") {
			functionResponse = convertTimestampToDate(functionResponse).toISOString();
		}
		if (functionName === "" && functionResponse === "") {
			this.logs = [];
			return;
		}
		this.logs = [`${i18n.t("sessions.historyResult")}: ${functionName} - ${functionResponse}`];
	}

	private handleFuncCall(session: ProtoSessionLogRecord) {
		this.type = SessionStateType.callSpec;

		const functionName = session[this.type]?.function?.function?.name || "";
		const args = (session[this.type]?.args || [])
			.map((arg: Value) => arg.string?.v)
			.join(", ")
			.replace(/, ([^,]*)$/, "");
		this.logs = [`${i18n.t("sessions.historyFunction")}: ${functionName}(${args})`];
	}

	private setDateTime(session: ProtoSessionLogRecord) {
		try {
			this.dateTime = convertTimestampToDate(session.t);
		} catch (error) {
			LoggerService.error("SessionState", (error as Error).message);
		}
	}

	private setErrorAndCallstack(session: ProtoSessionLogRecord) {
		this.error = session?.state?.error?.error?.message || i18n.t("errors.sessionLogMissingOnErrorType");
		this.callstackTrace = (session?.state?.error?.error?.callstack || []) as Callstack[];
	}

	getError(): string {
		return this.error!;
	}

	getCallstack(): Callstack[] {
		return this.callstackTrace;
	}

	isError(): boolean {
		return this.type === SessionStateType.error;
	}

	isRunning(): boolean {
		return this.type === SessionStateType.running;
	}

	isPrint(): boolean {
		return this.type === SessionStateType.print;
	}

	isFinished(): boolean {
		return this.type === SessionStateType.error || this.type === SessionStateType.completed;
	}

	containLogs(): boolean {
		return !!(this.logs && this.logs.length);
	}

	getLogs(): string[] {
		return this.logs || [];
	}
}
