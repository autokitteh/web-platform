import React, { useState } from 'react';

import { Icon } from '@components/atoms';
import { Menu } from '@components/molecules';

import IconLogo from '/assets/Logo.svg';
import IconLogoName from '/assets/LogoName.svg';

export default function Sidebar() {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      className="p-4 pt-6 pb-10 text-black"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="flex items-center gap-2.5 ml-1">
        <Icon src={IconLogo} alt="logo" />
        <Icon classes="w-20 h-3" src={IconLogoName} alt="autokitteh" isOpen={isHovering} />
      </div>
      <Menu classes="mt-8" isOpen={isHovering} />
    </div>
  );
}
