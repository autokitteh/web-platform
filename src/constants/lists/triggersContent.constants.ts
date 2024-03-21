import { ITabTrigger } from "@interfaces/components";

export const triggersData: ITabTrigger[] = [
	{
		id: 2,
		fileName: "AnnaOnTeams",
		func: "Microsoft Teams",
		row: Math.floor(Math.random() * 10) + 1,
		col: Math.floor(Math.random() * 10) + 1,
	},
	{
		id: 3,
		fileName: "TeamsAnnaOn",
		func: "TeamsMicrosoft",
		row: Math.floor(Math.random() * 10) + 1,
		col: Math.floor(Math.random() * 10) + 1,
	},
	{
		id: 1,
		fileName: "JeffOnSlack",
		func: "Slack",
		row: Math.floor(Math.random() * 10) + 1,
		col: Math.floor(Math.random() * 10) + 1,
	},
	{
		id: 4,
		fileName: "BobOnZoom",
		func: "Zoom",
		row: Math.floor(Math.random() * 10) + 1,
		col: Math.floor(Math.random() * 10) + 1,
	},
	{
		id: 5,
		fileName: "CarolOnDiscord",
		func: "Discord",
		row: Math.floor(Math.random() * 10) + 1,
		col: Math.floor(Math.random() * 10) + 1,
	},
	{
		id: 6,
		fileName: "DaveOnWebex",
		func: "Webex",
		row: Math.floor(Math.random() * 10) + 1,
		col: Math.floor(Math.random() * 10) + 1,
	},
];
