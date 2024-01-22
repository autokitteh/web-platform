import React, { useState } from 'react';
import clsx from 'clsx';

import { Icon } from '@components/atoms';

interface IMenuItem {
  icon: string;
  name: string;
  isOpen: boolean;
}

export default function MenuItem({ icon, name, isOpen = false }: IMenuItem) {
  const [isHovered, setIsHovered] = useState(false);

  const containerClasses = clsx('flex items-center gap-2.5 p-2 rounded-3xl transition duration-300', {
    'bg-greenLight ': isHovered,
    'bg-white': !isHovered,
  });

  const textClasses = clsx('overflow-hidden text-gray-700 text-sm', {
    'font-bold ': isHovered,
    'w-auto opacity-100': isOpen,
    'w-0 h-0 opacity-0': !isOpen,
  });

  return (
    <div className={containerClasses} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="w-8 h-8 p-1 flex items-center justify-center">
        <Icon src={icon} alt={name} classes="!w-auto !h-auto" />
      </div>
      <div className={textClasses}>{name}</div>
    </div>
  );
}
