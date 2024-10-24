import moment from "moment";

import { LoggerLevel } from "@enums";
import { dateTimeFormat } from "@src/constants";

import { useLoggerStore } from "@store";

/* eslint-disable no-console */

export class LoggerService {
	public static debug(namespace: string, message: string): void {
		this.output(namespace, message, LoggerLevel.debug);
	}

	public static error(namespace: string, message: string): void {
		this.output(namespace, message, LoggerLevel.error);
	}

	public static info(namespace: string, message: string): void {
		this.output(namespace, message, LoggerLevel.info);
	}

	public static print(namespace: string, message: string): void {
		this.output(namespace, message, LoggerLevel.log);
	}

	public static warn(namespace: string, message: string): void {
		this.output(namespace, message, LoggerLevel.warn);
	}

	private static output(namespace: string, message: string, level: LoggerLevel = LoggerLevel.info): void {
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

		useLoggerStore.getState().addLog({ message: formattedMessage, status: level, timestamp });
	}
}
