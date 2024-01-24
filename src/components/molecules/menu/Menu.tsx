import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@utils/index';

import { Button, Icon } from '@components/atoms';
import { IMenu } from '@components/molecules/menu';
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
            <Button className="hover:bg-green-light">
              <Icon className="w-8 h-8 p-1 " src={icon} alt={name} />
              {isOpen && name}
            </Button>
          </Link>
        </div>
      ))}
    </div>
  );
};
