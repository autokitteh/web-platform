import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '@components/atoms';

const meta: Meta<typeof Badge> = {
  title: 'Core/Badge',
  component: Badge,
  argTypes: {
    text: { control: 'text' },
    className: { control: 'text' },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: 'Default Badge',
    className: '',
  },
};

export const Custom: Story = {
  args: {
    text: 'Custom Badge',
    className: 'bg-blue-500 text-white',
  },
};
