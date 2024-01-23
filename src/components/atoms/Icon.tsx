import React from 'react';
import clsx from 'clsx';

interface IIcon {
  className?: string;
  alt?: string;
  src: string;
  isOpen?: boolean;
}

export default function Icon({ className, alt = 'icon', src, isOpen = true }: IIcon) {
  const iconClasses = clsx(className, {
    'hidden opacity-0': !isOpen,
  });

  return <img className={iconClasses} src={src} alt={alt} />;
}
