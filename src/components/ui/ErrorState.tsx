import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="notice notice-error" style={{ display: "flex", flexDirection: "column", gap: 10, borderRadius: 16, padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <AlertCircle size={18} />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            background: "none",
            border: "1.5px solid #E05252",
            borderRadius: 10,
            padding: "8px 16px",
            color: "#E05252",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            alignSelf: "flex-start",
          }}
        >
          Try again
        </button>
      )}
    </div>
  );
}
