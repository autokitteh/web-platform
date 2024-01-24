import type { Meta, StoryObj } from '@storybook/react';
import { MenuItem } from '@components/molecules/menu';
import NewProject from '@assets/sidebar/NewProject.svg';

const meta: Meta<typeof MenuItem> = {
  title: 'Buttons/MenuItem',
  component: MenuItem,
  argTypes: {
    icon: { control: 'text' },
    name: { control: 'text' },
    className: { control: 'text' },
    iconClasses: { control: 'text' },
    badgeText: { control: 'text' },
    isOpen: { control: 'boolean' },
    isHoverEffect: { control: 'boolean' },
    isActive: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: NewProject,
    name: 'Menu Item',
    iconClasses: '',
    badgeText: '',
    className: '',
    isOpen: true,
    isHoverEffect: true,
    isActive: false,
  },
};

export const CustomIcon: Story = {
  args: {
    ...Default.args,
    icon: NewProject,
    badgeText: '',
  },
  argTypes: {
    icon: { control: { type: 'file', accept: '.png, .jpg, .jpeg, .svg' } },
  },
};

export const Name: Story = {
  args: {
    ...Default.args,
    name: 'Menu Item',
  },
  argTypes: {
    icon: { control: 'none' },
    className: { control: 'none' },
    iconClasses: { control: 'none' },
    badgeText: { control: 'none' },
    isOpen: { control: 'none' },
    isHoverEffect: { control: 'none' },
    isActive: { control: 'none' },
  },
};
