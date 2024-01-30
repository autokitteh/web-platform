export const getIds = <Type>(objectsArray: Type[], property: keyof Type): Array<string> =>
	objectsArray.map((obj) => (typeof obj[property] === "string" ? (obj[property] as unknown as string) : ""));
