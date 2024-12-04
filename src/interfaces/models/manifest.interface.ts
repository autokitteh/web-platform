export interface Manifest {
	version: string;
	project: ProjectProperties;
}

interface ProjectProperties {
	name: string;
	triggers: TriggerProperties;
	vars: VarProperties;
}
interface TriggerProperties {
	name: string;
	event_type: string;
	filter: string;
	type: string;
	schedule: string;
	webhook: string;
	connection: string;
	call: string;
}

interface VarProperties {
	name: string;
	value: string;
}
