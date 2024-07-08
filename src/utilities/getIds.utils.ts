export const getIds = <Type>(objectsArray: Type[], property: keyof Type): Array<string> =>
	objectsArray.map((object) => (typeof object[property] === "string" ? (object[property] as unknown as string) : ""));
