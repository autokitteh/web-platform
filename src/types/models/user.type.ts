import { UserRoles } from "@src/enums";

export type User = {
	email: string;
	id: string;
	name: string;
	role?: UserRoles;
};
