import React, { useState } from 'react';
import clsx from 'clsx';

import { IMenuItem } from '@components/molecules/menu/menu.interface';

import { Icon, Badge } from '@components/atoms';

export default function MenuItem({
  icon,
  name,
  className,
  iconClasses,
  badgeText,
  isOpen = false,
  isHoverEffect = true,
  isActive = false,
}: IMenuItem) {
  const [isHovered, setIsHovered] = useState(false);

  const containerClasses = clsx(
    'flex items-center gap-2.5 p-2 rounded-3xl transition duration-300',
    {
      'bg-greenLight ': isHovered || isActive,
      'bg-transparent': !isHovered && !isActive,
    },
    className,
  );

  const textClasses = clsx('overflow-hidden text-gray-700 text-sm', {
    'font-bold ': isHovered || isActive,
    'w-auto opacity-100': isOpen,
    'hidden opacity-0': !isOpen,
  });

  return (
    <div
      className={containerClasses}
      onMouseEnter={() => isHoverEffect && setIsHovered(true)}
      onMouseLeave={() => isHoverEffect && setIsHovered(false)}
    >
      <div className={clsx('w-8 h-8 p-1 flex items-center justify-center relative', iconClasses, { hidden: !icon })}>
        <Icon src={icon || ''} alt={name} className="!w-auto !h-auto" />
        {badgeText && <Badge text={badgeText} className="absolute top-0 right-0" />}
      </div>
      <div className={textClasses}>{name}</div>
    </div>
  );
}
