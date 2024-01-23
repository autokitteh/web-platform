import React from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

import { IMenu } from '@components/molecules/menu/menu.interface';

import MenuItem from '@components/molecules/menu/MenuItem';
import { menuItems } from '@utils/constants/menuItems';

export default function Menu({ className, isOpen = false, onSubmenu }: IMenu) {
  return (
    <div className={clsx(className, 'grid gap-4')}>
      {menuItems.map(({ icon, name, href, submenu }, index) => (
        <div
          key={index}
          onMouseEnter={(e) => {
            onSubmenu?.({ submenu: submenu || null, top: e.currentTarget.getBoundingClientRect().top + 5 });
          }}
        >
          <Link to={href}>
            <MenuItem icon={icon} name={name} isOpen={isOpen} />
          </Link>
        </div>
      ))}
    </div>
  );
}
