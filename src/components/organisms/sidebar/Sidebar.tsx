import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { ISubmenuInfo } from '@components/molecules/menu/menu.interface';

import { Icon } from '@components/atoms';
import { Menu, MenuItem } from '@components/molecules';

import IconLogo from '/assets/Logo.svg';
import IconLogoName from '/assets/LogoName.svg';
import IconNotification from '/assets/sidebar/icon7.svg';
import PictureAvatar from '/assets/avatar.png';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [submenuInfo, setSubmenuInfo] = useState<ISubmenuInfo>({ submenu: null, top: 0 });

  return (
    <div
      className="flex items-start"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => {
        setIsOpen(false);
        setSubmenuInfo({ submenu: null, top: 0 });
      }}
    >
      <div className="h-full p-4 pt-6 pb-10 flex flex-col justify-between bg-white z-10">
        <div>
          <div className="flex items-center gap-2.5 ml-1">
            <Icon src={IconLogo} alt="logo" />
            <Icon className="w-20 h-3" src={IconLogoName} alt="autokitteh" isOpen={isOpen} />
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
              iconClasses="w-9 h-9 !p-0"
              icon={PictureAvatar}
              name="James L."
              isOpen={isOpen}
              isHoverEffect={false}
            />
          </Link>
        </div>
      </div>
      {submenuInfo.submenu && (
        <motion.div
          className="w-auto h-screen bg-gray-200 border-l border-r border-gray-300 mr-2.5 z-1"
          style={{ paddingTop: submenuInfo.top }}
          variants={{
            hidden: { opacity: 0, x: -100 },
            visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' } },
          }}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {submenuInfo.submenu.map(({ name, href }, idx) => (
            <Link key={idx} to={href} className="block px-3">
              <MenuItem name={name} isOpen={isOpen} className="px-4" />
            </Link>
          ))}
        </motion.div>
      )}
    </div>
  );
}
