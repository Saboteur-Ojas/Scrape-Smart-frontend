interface LoadingSpinnerProps {
  message?: string;
  fullPage?: boolean;
}

export function LoadingSpinner({ message, fullPage = false }: LoadingSpinnerProps) {
  return (
    <div
      className="spinner-wrapper"
      style={fullPage ? { minHeight: "60vh" } : undefined}
    >
      <div className="spinner" />
      {message && <p className="spinner-label">{message}</p>}
    </div>
  );
}
