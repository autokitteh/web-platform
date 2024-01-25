import React from 'react';
import { cn } from '@utils';

import { Link, Icon } from '@components/atoms';
import { IButton, EButtonVariant } from '@components/atoms/buttons';

interface IIconButtonProps extends Partial<IButton> {
  icon: string | React.FC<React.SVGProps<SVGSVGElement>>;
}

export const IconButton = ({ icon, className, variant, fontWeight, href, disabled, ...rest }: IIconButtonProps) => {
  const iconButtonClass = cn(
    'p-2 rounded-full transition duration-300 hover:bg-gray-800',
    {
      'hover:bg-transparent': variant === EButtonVariant.transparent,
      'bg-black': variant === EButtonVariant.filled,
      'border border-gray-400 hover:border-transparent': variant === EButtonVariant.outline,
    },
    {
      'opacity-40 cursor-not-allowed': disabled,
      'hover:bg-transparent hover:border-gray-400': disabled && variant === EButtonVariant.outline,
    },
    className,
  );

  return !href ? (
    <button {...rest} disabled={disabled} className={iconButtonClass}>
      <Icon src={icon} disabled={disabled} />
    </button>
  ) : (
    <Link to={href} {...rest} disabled={disabled} className={iconButtonClass}>
      <Icon src={icon} disabled={disabled} />
    </Link>
  );
};
