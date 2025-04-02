import moment from "moment";

import { LoggerLevel } from "@enums";
import { dateTimeFormat } from "@src/constants";
import { SessionEntrypoint } from "@src/interfaces/models";
import { Log } from "@src/interfaces/store";

import { useLoggerStore } from "@store";

/* eslint-disable no-console */

export class LoggerService {
	public static debug(namespace: string, message: string, consoleOnly?: boolean): void {
		this.output(namespace, message, LoggerLevel.debug, { consoleOnly });
	}

	public static error(namespace: string, message: string, consoleOnly?: boolean): void {
		this.output(namespace, message, LoggerLevel.error, { consoleOnly });
	}

	public static info(namespace: string, message: string, consoleOnly?: boolean): void {
		this.output(namespace, message, LoggerLevel.info, { consoleOnly });
	}

	public static print(namespace: string, message: string, consoleOnly?: boolean): void {
		this.output(namespace, message, LoggerLevel.log, { consoleOnly });
	}

	public static warn(namespace: string, message: string, consoleOnly?: boolean): void {
		this.output(namespace, message, LoggerLevel.warn, { consoleOnly });
	}

	public static lint(namespace: string, violationsLogs: Log[]): void {
		violationsLogs.forEach((log) => {
			this.output(namespace, log.message, log.status, { consoleOnly: false, location: log.location });
		});
	}

	private static output(
		namespace: string,
		message: string,
		level: LoggerLevel = LoggerLevel.info,
		options?: { consoleOnly?: boolean; location?: SessionEntrypoint; timestamp?: string }
	): void {
		const timestamp = moment().utc().local().format(dateTimeFormat);
		const formattedMessage = `[${namespace}] ${message}`;
		const locationInfo = options?.location
			? ` (Location: ${options.location.path}:${options.location.row}:${options.location.col})`
			: "";

		switch (level) {
			case LoggerLevel.error:
				console.error(`${timestamp} - [${level}] ${formattedMessage}${locationInfo}`);
				break;
			case LoggerLevel.warn:
				console.warn(`${timestamp} - [${level}] ${formattedMessage}${locationInfo}`);
				break;
			case LoggerLevel.debug:
				console.debug(`${timestamp} - [${level}] ${formattedMessage}${locationInfo}`);
				break;
			case LoggerLevel.info:
			default:
				console.log(`${timestamp} - [${level}] ${formattedMessage}${locationInfo}`);
				break;
		}

		if (options?.consoleOnly) {
			return;
		}

		useLoggerStore.getState().addLog({
			message: formattedMessage,
			status: level,
			timestamp,
			location: options?.location,
		});
	}
}
