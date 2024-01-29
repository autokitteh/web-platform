import React, { useState, useRef } from 'react';

import { IButton } from '@components/atoms/buttons';
import { Button, Icon, DropdownMenu } from '@components/atoms';

interface IDropdownButton extends Partial<IButton> {
  iconLeft?: string | React.FC<React.SVGProps<SVGSVGElement>>;
  name: string;
}

export const DropdownButton = ({ iconLeft, name, children, disabled }: IDropdownButton) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => setIsOpen(true);
  const handleMouseLeave = () => setIsOpen(false);

  return (
    <div className="relative" ref={dropdownRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="absolute w-full left-0 h-2 -bottom-2"></div>
      <Button disabled={disabled}>
        {iconLeft && <Icon disabled={disabled} src={iconLeft} />}
        {name}
      </Button>
      <DropdownMenu isOpen={isOpen}>{children}</DropdownMenu>
    </div>
  );
};
