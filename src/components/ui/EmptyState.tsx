import type { ReactNode } from "react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
  iconBg?: string;
}

export function EmptyState({ icon, title, subtitle, action, iconBg = "#EAF4E0" }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon && (
        <div className="empty-state__icon" style={{ background: iconBg }}>
          {icon}
        </div>
      )}
      <h3 className="empty-state__title">{title}</h3>
      {subtitle && <p className="empty-state__subtitle">{subtitle}</p>}
      {action && (
        <Button variant="primary" size="md" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
