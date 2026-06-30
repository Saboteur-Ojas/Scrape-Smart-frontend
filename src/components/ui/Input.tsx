import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightElement, id, className = "", ...rest }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className={`form-group ${className}`}>
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
          </label>
        )}
        <div className={`form-input-wrapper ${error ? "error" : ""}`}>
          {leftIcon && (
            <span style={{ display: "flex", alignItems: "center", color: "#7B7A9A", flexShrink: 0 }}>
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className="form-input-inner"
            style={{ background: "transparent" }}
            {...rest}
          />
          {rightElement}
        </div>
        {error && <p className="form-error">{error}</p>}
        {hint && !error && <p className="form-hint">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
