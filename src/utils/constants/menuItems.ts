import Icon1 from '/assets/sidebar/icon1.svg';
import Icon2 from '/assets/sidebar/icon2.svg';
import Icon3 from '/assets/sidebar/icon3.svg';
import Icon4 from '/assets/sidebar/icon4.svg';
import Icon5 from '/assets/sidebar/icon5.svg';
import Icon6 from '/assets/sidebar/icon6.svg';

export const menuItems = [
    {
        icon: Icon1,
        name: 'New Project',
        href: '/app/new',
    },
    {
        icon: Icon2,
        name: 'My Projects',
        href: '/app/my',
        submenu: [
            {
                name: 'AK Pagerduty',
                href: '/app',
            },
            {
                name: 'Google signup',
                href: '/app',
            },
            {
                name: 'New Project',
                href: '/app',
            },
            {
                name: 'Project name',
                href: '/app',
            },
            {
                name: 'New Project',
                href: '/app',
            },
            {
                name: 'Slack notification',
                href: '/app',
            },
            {
                name: 'AWS monitor',
                href: '/app',
            },
            {
                name: 'New Project',
                href: '/app',
            },
            {
                name: 'Github monitor',
                href: '/app',
            },
            {
                name: 'New Project',
                href: '/app',
            },
            {
                name: 'Pagerduty monitor',
                href: '/app',
            },
            {
                name: 'AWS monitor',
                href: '/app',
            },
        ]
    },
    {
        icon: Icon3,
        name: 'Dashboard',
        href: '/app/dashboard',
    },
    {
        icon: Icon4,
        name: 'Connections',
        href: '/app/connections',
        submenu: [
            {
                name: 'Slack notification',
                href: '/app',
            },
            {
                name: 'AWS monitor',
                href: '/app',
            },
            {
                name: 'New Project',
                href: '/app',
            },
            {
                name: 'AK Pagerduty',
                href: '/app',
            },
        ]
    },
    {
        icon: Icon5,
        name: 'Stats',
        href: '/app/stats',
    },
    {
        icon: Icon6,
        name: 'Settings',
        href: '/app/settings',
    },
];