import React from 'react';
import clsx from 'clsx';

interface IIcon {
  classes?: string;
  alt?: string;
  src: string;
  isOpen?: boolean;
}

export default function Icon({ classes, alt = 'icon', src, isOpen = true }: IIcon) {
  const iconClasses = clsx(classes, {
    'hidden opacity-0': !isOpen,
  });

  return <img className={iconClasses} src={src} alt={alt} />;
}
