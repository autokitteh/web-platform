import dayjs from "dayjs";
import { t as i18n } from "i18next";

import { SessionLogRecord as ProtoSessionLogRecord } from "@ak-proto-ts/sessions/v1/session_pb";
import { Value } from "@ak-proto-ts/values/v1/values_pb";
import { dateTimeFormat, namespaces } from "@constants";
import { SessionLogRecordType, SessionStateType } from "@enums";
import { convertErrorProtoToModel } from "@models/error.model";
import { LoggerService } from "@services";
import { Callstack, SessionOutputLog } from "@src/interfaces/models";
import { convertTimestampToDate, convertTimestampToEpoch } from "@utilities";

export class SessionLogRecord {
	callstackTrace: Callstack[] = [];
	dateTime?: Date;
	error?: string;
	logs?: string;
	state?: SessionStateType;
	type: SessionLogRecordType = SessionLogRecordType.unknown;
	key?: string;

	constructor(logRecord: ProtoSessionLogRecord) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { processId, t, ...props } = logRecord;

		const logRecordType = this.getLogRecordType(props);

		if (!logRecordType) {
			LoggerService.error(
				namespaces.sessionsHistory,
				i18n("sessionLogRecordTypeNotFound", { ns: "services", props: Object.keys(props).join(", ") })
			);

			return;
		}

		this.key = convertTimestampToEpoch(logRecord.t).toString();

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
				this.logs = logRecord.print?.text;
				break;
			default:
		}

		if (logRecordType !== SessionLogRecordType.callAttemptStart) {
			this.dateTime = convertTimestampToDate(logRecord.t);
		}
	}

	private getLogRecordType(props: { [key: string]: any }): SessionLogRecordType | undefined {
		const activeKey = Object.keys(props).find((key) => props[key] !== undefined);

		if (activeKey && activeKey in SessionLogRecordType) {
			return activeKey as SessionLogRecordType;
		}

		return undefined;
	}

	private handleCallAttemptComplete(logRecord: ProtoSessionLogRecord) {
		this.type = SessionLogRecordType.callAttemptComplete;

		const sessionLogRecord = logRecord[this.type];
		if (sessionLogRecord?.result?.value?.time) {
			this.logs = `${i18n("historyFunction", { ns: "services" })} - 
					${i18n("historyResult", { ns: "services" })}: ${i18n("historyTime", { ns: "services" })} - 
						${convertTimestampToDate(sessionLogRecord?.result?.value?.time?.v).toISOString()}`;

			return;
		}
		if (sessionLogRecord?.result?.value?.nothing) {
			this.logs = `${i18n("historyFunction", { ns: "services" })} - 
				${i18n("historyResult", { ns: "services" })}: 
				${i18n("historyNoOutput", { ns: "services" })}`;

			return;
		}

		const functionResponse = sessionLogRecord?.result?.value?.struct?.fields?.body?.string?.v || "";
		const functionName = sessionLogRecord?.result?.value?.struct?.ctor?.string?.v || "";

		if (!functionName && !functionResponse) {
			this.logs = undefined;

			return;
		}
		this.logs = `${i18n("historyFunction", { ns: "services" })} - 
			${i18n("historyResult", { ns: "services" })}: 
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
		this.logs = `${i18n("historyFunction", { ns: "services" })}: ${functionName}(${args})`;
	}

	private handleStateRecord(logRecord: ProtoSessionLogRecord) {
		this.type = SessionLogRecordType.state;
		const activeKey = Object.keys(logRecord.state!).find(
			(key) =>
				logRecord.state?.[key as unknown as SessionStateType] !== undefined &&
				typeof logRecord.state?.[key as unknown as SessionStateType] === "object"
		);
		this.state = activeKey as SessionStateType;
		if (this.state === SessionStateType.running) {
			const functionRunning = logRecord.state?.running?.call?.function?.name;
			this.logs = functionRunning
				? `${i18n("historyInitFunction", { ns: "services" })}: ${functionRunning}`
				: undefined;
		}
		if (this.state === SessionStateType.error) {
			this.error = convertErrorProtoToModel(
				logRecord.state?.error?.error?.value,
				i18n("sessionLogMissingOnErrorType", { ns: "errors" })
			)?.message;
			this.logs = "Error:";
			this.logs += `\n- ${this.error}\n`;
			this.callstackTrace = (logRecord?.state?.error?.error?.callstack || []) as Callstack[];
			this.logs += `Callstack:\n`;
			this.callstackTrace.map(({ location: { col, name, path, row } }) => {
				this.logs += `- ${path}: ${row}.${col}: ${name}\n`;
			});
		}
		if (this.isFinished()) {
			const finishedMessagePrint = `${i18n("lastPrintForSessionLog", {
				ns: "services",
				sessionState: this.state || "unknown",
			})}`;

			this.logs = this.logs ? `${this.logs}${finishedMessagePrint}` : finishedMessagePrint;
		}
	}

	isFinished(): boolean {
		return (
			this.state === SessionStateType.error ||
			this.state === SessionStateType.completed ||
			this.state === SessionStateType.stopped
		);
	}
}

export const convertSessionLogProtoToViewerOutput = (
	sessionStateRecord?: ProtoSessionLogRecord
): SessionOutputLog | undefined => {
	if (!sessionStateRecord) return;

	const record = new SessionLogRecord(sessionStateRecord);
	if (
		record.state !== SessionStateType.error &&
		record.state !== SessionStateType.completed &&
		record.state !== SessionStateType.stopped
	) {
		return;
	}
	const formattedDateTime = dayjs(record.dateTime).format(dateTimeFormat);

	return {
		print: record?.logs || "",
		time: formattedDateTime,
	};
};
