import React from 'react';
import { topbarItems } from '@utils';
import { Button, IconButton, Icon } from '@components/atoms';
import FullScreenI from '@assets/topbar/FullScreen.svg?react';

interface ITopbar {
  name: string;
  version: string;
}

export const Topbar = ({ name, version }: ITopbar) => {
  const handleFullScreen = () => {
    document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
  };

  return (
    <div className="flex justify-between items-center bg-gray-700 gap-5 pl-7 pr-3.5 py-3 rounded-b-xl">
      <div className="flex items-end gap-3">
        <span className="font-semibold text-2xl leading-6">{name}</span>
        <span className="font-semibold text-sm text-gray-300 leading-none">{version}</span>
      </div>
      <div className="flex gap-3">
        {topbarItems.map(({ id, name, href, icon, disabled }) => (
          <Button
            key={id}
            href={href}
            variant="outline"
            color="white"
            fontWeight={600}
            className="px-4"
            disabled={disabled}
          >
            <Icon src={icon} disabled={disabled} />
            {name}
          </Button>
        ))}
        <IconButton variant="outline" icon={FullScreenI} onClick={handleFullScreen} />
      </div>
    </div>
  );
};
