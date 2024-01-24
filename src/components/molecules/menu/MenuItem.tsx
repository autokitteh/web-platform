import React, { useState } from 'react';
import { cn } from '@utils/index';

import { IMenuItem } from '@components/molecules/menu';

import { Icon, Badge } from '@components/atoms';

export const MenuItem = ({
  icon,
  name,
  className,
  iconClasses,
  badgeText,
  isOpen = false,
  isHoverEffect = true,
  isActive = false,
}: IMenuItem) => {
  const [isHovered, setIsHovered] = useState(false);

  const containerClasses = cn(
    'flex items-center gap-2.5 p-2 rounded-3xl transition duration-300',
    {
      'bg-green-light ': isHovered || isActive,
      'bg-transparent': !isHovered && !isActive,
    },
    className,
  );

  const textClasses = cn('overflow-hidden text-gray-700 text-sm', {
    'font-bold ': isHovered || isActive,
    'w-auto opacity-100': isOpen,
    'hidden opacity-0': !isOpen,
  });

  const handleHover = (hoverState: boolean) => {
    if (isHoverEffect) {
      setIsHovered(hoverState);
    }
  };

  return (
    <div className={containerClasses} onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
      <div className={cn('w-8 h-8 p-1 flex items-center justify-center relative', iconClasses, { hidden: !icon })}>
        <Icon src={icon || ''} alt={name} className="w-auto h-auto" />
        {badgeText && <Badge text={badgeText} className="absolute top-0 right-0" />}
      </div>
      <div className={textClasses}>{name}</div>
    </div>
  );
};
