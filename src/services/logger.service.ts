import moment from "moment";

import { LoggerLevel } from "@enums";
import { dateTimeFormat } from "@src/constants";

import { useLoggerStore } from "@store";

/* eslint-disable no-console */

export class LoggerService {
	public static debug(namespace: string, message: string, consoleOnly?: boolean): void {
		this.output(namespace, message, LoggerLevel.debug, consoleOnly);
	}

	public static error(namespace: string, message: string, consoleOnly?: boolean): void {
		this.output(namespace, message, LoggerLevel.error, consoleOnly);
	}

	public static info(namespace: string, message: string, consoleOnly?: boolean): void {
		this.output(namespace, message, LoggerLevel.info, consoleOnly);
	}

	public static print(namespace: string, message: string, consoleOnly?: boolean): void {
		this.output(namespace, message, LoggerLevel.log, consoleOnly);
	}

	public static warn(namespace: string, message: string, consoleOnly?: boolean): void {
		this.output(namespace, message, LoggerLevel.warn, consoleOnly);
	}

	private static output(
		namespace: string,
		message: string,
		level: LoggerLevel = LoggerLevel.info,
		consoleOnly?: boolean
	): void {
		const timestamp = moment().utc().local().format(dateTimeFormat);
		const formattedMessage = `[${namespace}] ${message}`;

		switch (level) {
			case LoggerLevel.error:
				console.error(`${timestamp} - [${level}] ${formattedMessage}`);
				break;
			case LoggerLevel.warn:
				console.warn(`${timestamp} - [${level}] ${formattedMessage}`);
				break;
			case LoggerLevel.debug:
				console.debug(`${timestamp} - [${level}] ${formattedMessage}`);
				break;
			case LoggerLevel.info:
			default:
				console.log(`${timestamp} - [${level}] ${formattedMessage}`);
				break;
		}

		if (consoleOnly) {
			return;
		}

		useLoggerStore.getState().addLog({ message: formattedMessage, status: level, timestamp });
	}
}
