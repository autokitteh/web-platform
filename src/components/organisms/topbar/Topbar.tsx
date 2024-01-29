import React from 'react';

import { topbarItems } from '@utils';
import { Button, IconButton, Icon } from '@components/atoms';
import { DropdownButton } from '@components/molecules';

import FullScreenI from '@assets/topbar/FullScreen.svg?react';
import More from '@assets/topbar/More.svg?react';

interface ITopbar {
  name: string;
  version: string;
}

export const Topbar = ({ name, version }: ITopbar) => {
  return (
    <div className="flex justify-between items-center bg-gray-700 gap-5 pl-7 pr-3.5 py-3 rounded-b-xl">
      <div className="flex items-end gap-3">
        <span className="font-semibold text-2xl leading-6">{name}</span>
        <span className="font-semibold text-sm text-gray-300 leading-none">{version}</span>
      </div>
      <div className="flex items-center gap-3">
        {topbarItems.map(({ id, name, href, icon, disabled }) => (
          <Button
            key={id}
            href={href}
            variant="outline"
            color="white"
            fontWeight={600}
            className="px-4 py-2.5"
            disabled={disabled}
          >
            <Icon src={icon} disabled={disabled} />
            {name}
          </Button>
        ))}
        <DropdownButton
          iconLeft={More}
          name="More"
          variant="outline"
          color="white"
          fontWeight={600}
          className="px-4 py-2.5"
        >
          <div className="grid gap-2">
            {topbarItems.map(({ id, name, href, icon, disabled }) => (
              <Button
                key={id}
                href={href}
                variant="outline"
                color="white"
                fontWeight={600}
                className="px-4 py-1.5"
                disabled={disabled}
              >
                <Icon src={icon} disabled={disabled} />
                {name}
              </Button>
            ))}
          </div>
        </DropdownButton>
        <IconButton variant="outline" icon={FullScreenI} />
      </div>
    </div>
  );
};
