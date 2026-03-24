"use client";

import { ReactNode } from "react";

interface ButtonProps {
  variant: "primary" | "outline" | "secondary";
  className?: string;
  onClick?: () => void;
  size: "lg" | "sm";
  children?: ReactNode;
}

export const Button = ({ size, variant, className, onClick, children }: ButtonProps) => {
  return (
    <button
      className={`${className} ${variant === "primary" ? "bg-primary text-primary-foreground" : ""} ${variant === "secondary" ? "bg-secondary text-secondary-foreground" : ""} ${variant === "outline" ? "border border-input bg-transparent" : ""} ${size === "lg" ? "px-4 py-2" : "px-2 py-1"}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};