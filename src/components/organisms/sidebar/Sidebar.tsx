import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { Icon } from '@components/atoms';
import { ISubmenuInfo, Submenu, Menu, MenuItem } from '@components/molecules/menu';

import IconLogo from '@assets/Logo.svg';
import IconLogoName from '@assets/LogoName.svg';
import IconNotification from '@assets/sidebar/Notification.svg';
import PictureAvatar from '@assets/avatar.png';

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [submenuInfo, setSubmenuInfo] = useState<ISubmenuInfo>({ submenu: null, top: 0 });

  const handleMouseEnter = () => setIsOpen(true);

  const handleMouseLeave = () => {
    setIsOpen(false);
    setSubmenuInfo({ submenu: null, top: 0 });
  };

  return (
    <div className="flex items-start" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="h-full p-4 pt-6 pb-10 flex flex-col justify-between bg-white z-10">
        <div>
          <div className="flex items-center gap-2.5 ml-1">
            <Icon src={IconLogo} alt="logo" />
            <Icon className="w-20 h-3" src={IconLogoName} alt="autokitteh" isVisible={isOpen} />
          </div>
          <Menu className="mt-8" isOpen={isOpen} onSubmenu={setSubmenuInfo} />
        </div>
        <div className="grid gap-5">
          <Link to="#">
            <MenuItem
              icon={IconNotification}
              name="Notifications"
              badgeText="2"
              isOpen={isOpen}
              isHoverEffect={false}
            />
          </Link>
          <Link to="#">
            <MenuItem
              iconClasses="w-9 h-9 p-0"
              icon={PictureAvatar}
              name="James L."
              isOpen={isOpen}
              isHoverEffect={false}
            />
          </Link>
        </div>
      </div>
      {submenuInfo.submenu && <Submenu submenuInfo={submenuInfo} isOpen={isOpen} />}
    </div>
  );
};
