import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

export function Card({ children, className = "", style, size = "md", onClick }: CardProps) {
  const sizeClass = size === "sm" ? "card card-sm" : size === "lg" ? "card card-lg" : "card";
  return (
    <div
      className={`${sizeClass} ${className}`}
      style={{ cursor: onClick ? "pointer" : undefined, ...style }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
