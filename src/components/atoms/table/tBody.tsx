import React from "react";
import { TableProps } from "@interfaces/components";

export const TBody = ({ className, children }: TableProps) => <tbody className={className}>{children}</tbody>;
