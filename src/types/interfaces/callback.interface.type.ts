export type Callback<T = void> = T extends void ? () => void : (arg: T) => void;
