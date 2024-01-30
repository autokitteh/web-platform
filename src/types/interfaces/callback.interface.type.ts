export type Callback<T = void> = T extends void ? () => void : (arg: T) => void;
export type SectionRowsRange = { startIndex: number; endIndex: number };
