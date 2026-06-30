import React, { forwardRef } from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  maxChars?: number;
  currentLength?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, maxChars, currentLength, id, className = "", ...rest }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className={`form-group ${className}`}>
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          className={`form-input ${error ? "error" : ""}`}
          style={{ resize: "vertical", minHeight: 96, fontFamily: "inherit" }}
          {...rest}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
          {error ? <p className="form-error" style={{ margin: 0 }}>{error}</p> : <span />}
          {maxChars !== undefined && currentLength !== undefined && (
            <span
              className="form-hint"
              style={{ margin: 0, color: currentLength > maxChars * 0.9 ? "#D4880A" : undefined }}
            >
              {currentLength}/{maxChars}
            </span>
          )}
        </div>
        {hint && !error && <p className="form-hint">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
