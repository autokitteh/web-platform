import React from 'react';

import { cn } from '@utils';
import { Link } from '@components/atoms';
import { IButton, EButtonVariant, EButtonColor } from '@components/atoms/buttons';

export const Button = ({ children, className, variant, color, fontWeight, href, disabled }: Partial<IButton>) => {
  const buttonClass = cn(
    'w-full flex items-center gap-2.5 p-2 rounded-3xl transition duration-300 text-sm text-gray-700 text-center hover:bg-gray-800',
    {
      'hover:bg-transparent': variant === EButtonVariant.transparent,
      'bg-black text-white': variant === EButtonVariant.filled,
      'border border-gray-400': variant === EButtonVariant.outline,
    },
    {
      'text-white': color === EButtonColor.white,
      'text-black': color === EButtonColor.black,
      'text-gray-700': color === EButtonColor.gray,
    },
    {
      'font-medium': fontWeight === 500,
      'font-semibold': fontWeight === 600,
      'font-bold': fontWeight === 700,
      'font-extrabold': fontWeight === 800,
    },
    {
      'text-gray-400 pointer-events-none': disabled,
      'border-gray-500': disabled && variant === EButtonVariant.outline,
    },
    className,
  );

  return !href ? (
    <button disabled={disabled} className={buttonClass}>
      {children}
    </button>
  ) : (
    <Link to={href} disabled={disabled} className={buttonClass}>
      {children}
    </Link>
  );
};
