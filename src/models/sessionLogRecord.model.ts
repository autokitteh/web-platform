import { SessionLogRecord as ProtoSessionLogRecord } from "@ak-proto-ts/sessions/v1/session_pb";
import { Value } from "@ak-proto-ts/values/v1/values_pb";
import { namespaces } from "@constants";
import { SessionStateType, SessionLogRecordType } from "@enums";
import { convertErrorProtoToModel } from "@models/error.model";
import { LoggerService } from "@services";
import { Callstack } from "@type/models";
import { convertTimestampToDate } from "@utilities";
import i18n from "i18next";

export class SessionLogRecord {
	type: SessionLogRecordType = SessionLogRecordType.unknown;
	state?: SessionStateType;
	callstackTrace: Callstack[] = [];
	logs?: string;
	error?: string;
	dateTime?: Date;

	constructor(logRecord: ProtoSessionLogRecord) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { t, ...props } = logRecord;
		if (Object.keys(props).length > 1) {
			LoggerService.error(
				namespaces.sessionsHistory,
				i18n.t("errors.sessionLogRecordMultipleProps", { props: Object.keys(props).join(", ") })
			);
			return;
		}
		const logRecordType = Object.keys(props)[0] as SessionLogRecordType;

		switch (logRecordType) {
			case SessionLogRecordType.callAttemptStart:
				this.type = SessionLogRecordType.callAttemptStart;
				this.dateTime = convertTimestampToDate(logRecord[SessionLogRecordType.callAttemptStart]!.startedAt);
				break;
			case SessionLogRecordType.callAttemptComplete:
				this.handleCallAttemptComplete(logRecord);
				break;
			case SessionLogRecordType.callSpec:
				this.handleFuncCall(logRecord);
				break;
			case SessionLogRecordType.state:
				this.handleStateRecord(logRecord);
				break;
			case SessionLogRecordType.print:
				this.type = SessionLogRecordType.print;
				this.logs = `${i18n.t("services.print")}: ${logRecord.print!.text}`;
				break;
		}

		if (logRecordType !== SessionLogRecordType.callAttemptStart) {
			this.dateTime = convertTimestampToDate(logRecord.t);
		}
	}

	private handleStateRecord(logRecord: ProtoSessionLogRecord) {
		this.type = SessionLogRecordType.state;
		this.state = Object.keys(logRecord.state!)[0] as SessionStateType;
		if (this.state === SessionStateType.running) {
			const functionRunning = logRecord.state?.running?.call?.function?.name;
			this.logs = functionRunning ? `${i18n.t("services.historyInitFunction")}: ${functionRunning}` : undefined;
		}
		if (this.state === SessionStateType.error) {
			this.error = convertErrorProtoToModel(
				logRecord.state?.error?.error?.value,
				i18n.t("services.sessionLogMissingError")
			)?.message;
			this.callstackTrace = (logRecord?.state?.error?.error?.callstack || []) as Callstack[];
		}
	}

	private handleCallAttemptComplete(logRecord: ProtoSessionLogRecord) {
		this.type = SessionLogRecordType.callAttemptComplete;

		const sessionLogRecord = logRecord[this.type];
		if (sessionLogRecord?.result?.value?.time) {
			this.logs = `${i18n.t("services.historyFunction")} - 
				${i18n.t("services.historyResult")}: ${i18n.t("services.historyTime")} - 
				${convertTimestampToDate(sessionLogRecord?.result?.value?.time?.v).toISOString()}`;
			return;
		}
		if (sessionLogRecord?.result?.value?.nothing) {
			this.logs = `${i18n.t("services.historyFunction")} - 
				${i18n.t("services.historyResult")}: 
				${i18n.t("services.historyNoOutput")}`;
			return;
		}

		const functionResponse = sessionLogRecord?.result?.value?.struct?.fields?.body?.string?.v || "";
		const functionName = sessionLogRecord?.result?.value?.struct?.ctor?.string?.v || "";

		if (!functionName && !functionResponse) {
			this.logs = undefined;
			return;
		}
		this.logs = `${i18n.t("services.historyFunction")} - 
			${i18n.t("services.historyResult")}: 
			${functionName} - ${functionResponse}`;
	}

	private handleFuncCall(logRecord: ProtoSessionLogRecord) {
		this.type = SessionLogRecordType.callSpec;
		const sessionLogRecord = logRecord[this.type];

		const functionName = sessionLogRecord?.function?.function?.name || "";
		const args = (sessionLogRecord?.args || [])
			.map((arg: Value) => arg.string?.v)
			.join(", ")
			.replace(/, ([^,]*)$/, "");
		this.logs = `${i18n.t("services.historyFunction")}: ${functionName}(${args})`;
	}

	getError(): string {
		return this.error!;
	}

	getCallstack(): Callstack[] {
		return this.callstackTrace;
	}

	isError(): boolean {
		return this.state === SessionStateType.error;
	}

	isRunning(): boolean {
		return this.state === SessionStateType.running;
	}

	isPrint(): boolean {
		return this.type === SessionLogRecordType.print;
	}

	isFinished(): boolean {
		return (
			this.state === SessionStateType.error ||
			this.state === SessionStateType.completed ||
			this.state === SessionStateType.stopped
		);
	}

	containLogs(): boolean {
		return !!(this.logs && this.logs.length);
	}

	getLogs(): string | undefined {
		return this.logs;
	}
}
