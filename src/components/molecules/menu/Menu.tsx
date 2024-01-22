import React from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

import MenuItem from './MenuItem';
import { menuItems } from '@utils/constants/menuItems';

interface IMenu {
  classes?: string;
  isOpen: boolean;
}

export default function Menu({ classes, isOpen = false }: IMenu) {
  return (
    <div className={clsx(classes, 'grid gap-4')}>
      {menuItems.map(({ icon, name, href }) => (
        <Link to={href}>
          <MenuItem icon={icon} name={name} isOpen={isOpen} />
        </Link>
      ))}
    </div>
  );
}
