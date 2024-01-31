import { LoggerLevel } from "@enums";
import moment from "moment";

export class LoggerService {
	private static output(namespace: string, message: string, level: string = LoggerLevel.info): void {
		console.log(`${moment().format("YYYY-MM-DD HH:mm:ss")} - [${namespace}] [${level}] ${message}`);
	}

	public static info(namespace: string, message: string): void {
		this.output(namespace, message);
	}

	public static error(namespace: string, message: string): void {
		this.output(namespace, message, LoggerLevel.error);
	}

	public static debug(namespace: string, message: string): void {
		this.output(namespace, message, LoggerLevel.debug);
	}

	public static warn(namespace: string, message: string): void {
		this.output(namespace, message, LoggerLevel.warn);
	}

	public static print(namespace: string, message: string): void {
		console.log(`[${namespace}]: ${message}`);
	}

	public static printError(namespace: string, message: string): void {
		console.log(`Error: [${namespace}]: ${message}`);
	}
}
