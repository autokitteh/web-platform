import { TableProps } from "@interfaces/components";
import React from "react";

export const TBody = ({ children, className }: TableProps) => <tbody className={className}>{children}</tbody>;
