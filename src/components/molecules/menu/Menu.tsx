import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@utils/index';

import { MenuItem, IMenu } from '@components/molecules/menu';
import { menuItems } from '@utils/index';

export const Menu = ({ className, isOpen = false, onSubmenu }: IMenu) => {
  return (
    <div className={cn(className, 'grid gap-4')}>
      {menuItems.map(({ icon, name, href, submenu, id }) => (
        <div
          key={id}
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
};
