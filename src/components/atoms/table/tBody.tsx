import React from "react";

import { TableProps } from "@interfaces/components";

export const TBody = ({ children, className }: TableProps) => <tbody className={className}>{children}</tbody>;
