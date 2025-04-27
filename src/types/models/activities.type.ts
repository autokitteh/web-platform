import { ActivityState } from "@src/constants";

export type ActivityStateType = (typeof ActivityState)[keyof typeof ActivityState];
