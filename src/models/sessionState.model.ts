import { SessionStateType } from "@enums";
import { ProtoSessionHistoryState } from "@type/models";
import i18n from "i18next";
import { get } from "lodash";

class CreatedState {}

class RunningState {
	logs: string[];
	call?: object;

	constructor(prints: string[], call?: object) {
		this.logs = prints;
		this.call = call;
	}
}

class ErrorState {
	error: string;

	constructor(error: string) {
		this.error = error;
	}
}

class CompletedState {
	logs: string[];
	exports: Map<string, object>;
	returnValue: object;

	constructor(prints: string[], exports: Map<string, object>, returnValue: object) {
		this.logs = prints;
		this.exports = exports;
		this.returnValue = returnValue;
	}
}

export class SessionState {
	state: CreatedState | RunningState | ErrorState | CompletedState | undefined;

	constructor(state: ProtoSessionHistoryState) {
		const stateCase = get(state, "states.case");
		let prints, call, exports, returnValue;

		if (stateCase) {
			switch (stateCase) {
				case SessionStateType.created:
					this.state = new CreatedState();
					break;
				case SessionStateType.running:
					prints = get(state, "states.prints", []);
					call = get(state, "states.call", {});
					this.state = new RunningState(prints, call);
					break;
				case SessionStateType.error: {
					const errorMessage = get(state, "states.value.error.message", i18n.t("errors.unexpectedError"));
					this.state = new ErrorState(errorMessage);
					break;
				}
				case SessionStateType.completed:
					prints = get(state, "states.value.prints", []);
					exports = get(state, "states.value.exports", new Map());
					returnValue = get(state, "states.value.returnValue", {});
					this.state = new CompletedState(prints, exports, returnValue);
					break;
				default:
					this.state = new ErrorState(i18n.t("errors.unexpectedSessionStateType"));
			}
			return;
		}
		this.state = new ErrorState(i18n.t("errors.missingSessionStateType"));
	}

	getError(): string {
		if (this.state instanceof ErrorState) {
			return this.state.error;
		}
		return i18n.t("errors.unexpectedError");
	}

	isError(): this is { state: ErrorState } {
		return this.state instanceof ErrorState;
	}

	containLogs(): boolean {
		return (this.state instanceof RunningState || this.state instanceof CompletedState) && this.state.logs.length > 0;
	}

	getLogs(): string[] {
		if (this.containLogs()) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			//@ts-expect-error
			return this.state.logs;
		}
		return [];
	}
}
