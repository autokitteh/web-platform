import React, { MouseEventHandler } from 'react';

import { cn } from '@utils';

export enum EButtonVariant {
  default = 'default',
  transparent = 'transparent',
  filled = 'filled',
  outline = 'outline',
}
export enum EButtonColor {
  black = 'black',
  white = 'white',
  gray = 'gray',
}

type TButtonVariant = keyof typeof EButtonVariant;
type TButtonColor = keyof typeof EButtonColor;

interface IButton
  extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>,
    React.AriaAttributes {
  className?: string;
  variant?: TButtonVariant;
  color?: TButtonColor;
  children: React.ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
}

export const Button = ({ children, className, variant, color, ...rest }: IButton) => {
  const buttonClass = cn(
    'w-full flex items-center gap-2.5 p-2 rounded-3xl transition duration-300 text-sm text-gray-700 text-center hover:bg-gray-200 hover:text-gray-700',
    {
      'hover:bg-transparent': variant === EButtonVariant.transparent,
      'bg-black text-white': variant === EButtonVariant.filled,
      border: variant === EButtonVariant.outline,
    },
    {
      'text-white': color === EButtonColor.white,
      'text-black': color === EButtonColor.black,
      'text-gray-700': color === EButtonColor.gray,
    },
    className,
  );

  return (
    <button {...rest} className={buttonClass}>
      {children}
    </button>
  );
};
