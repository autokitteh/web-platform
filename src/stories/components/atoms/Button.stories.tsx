import type { Meta, StoryObj } from '@storybook/react';
import { Button, EButtonVariant, EButtonColor } from '@components/atoms/buttons';

const meta: Meta<typeof Button> = {
  title: 'Buttons/Button',
  component: Button,
  argTypes: {
    className: { control: 'text' },
    variant: {
      control: 'select',
      options: Object.values(EButtonVariant),
    },
    color: {
      control: 'select',
      options: Object.values(EButtonColor),
    },
    children: { control: 'text' },
    onClick: { action: 'clicked' },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Click Me',
    className: '',
    variant: EButtonVariant.default,
    color: EButtonColor.gray,
  },
};

export const Filled: Story = {
  args: {
    ...Default.args,
    variant: EButtonVariant.filled,
    color: EButtonColor.white,
    children: 'Filled Button',
  },
};

export const Outline: Story = {
  args: {
    ...Default.args,
    variant: EButtonVariant.outline,
    children: 'Outline Button',
  },
};

export const Transparent: Story = {
  args: {
    ...Default.args,
    variant: EButtonVariant.transparent,
    children: 'Transparent Button',
  },
};
