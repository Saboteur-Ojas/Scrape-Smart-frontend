import React from "react";

type ButtonVariant = "primary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = "",
  ...rest
}: ButtonProps) {
  const classes = [
    "btn",
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? "btn-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} disabled={disabled || loading} {...rest}>
      {loading ? (
        <>
          <span
            style={{
              width: 16,
              height: 16,
              border: "2px solid rgba(255,255,255,0.3)",
              borderTopColor: variant === "primary" ? "#fff" : "#82AA68",
              borderRadius: "50%",
              animation: "spin 0.75s linear infinite",
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          {children}
        </>
      ) : (
        <>
          {leftIcon && <span style={{ display: "flex", alignItems: "center" }}>{leftIcon}</span>}
          {children}
          {rightIcon && <span style={{ display: "flex", alignItems: "center" }}>{rightIcon}</span>}
        </>
      )}
    </button>
  );
}
