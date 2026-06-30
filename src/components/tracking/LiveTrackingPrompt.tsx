import { MapPin, X } from "lucide-react";
import { Button } from "../ui/Button";

interface LiveTrackingPromptProps {
  open: boolean;
  loading?: boolean;
  error?: string;
  onEnable: () => void;
  onSkip: () => void;
}

export function LiveTrackingPrompt({ open, loading, error, onEnable, onSkip }: LiveTrackingPromptProps) {
  if (!open) return null;

  return (
    <div className="tracking-modal-backdrop" role="presentation">
      <div className="tracking-modal" role="dialog" aria-modal="true" aria-labelledby="tracking-title">
        <button className="tracking-modal__close" type="button" onClick={onSkip} aria-label="Close tracking prompt">
          <X size={16} />
        </button>
        <div className="tracking-modal__icon">
          <MapPin size={26} color="#82AA68" />
        </div>
        <h2 id="tracking-title">Enable Live Tracking?</h2>
        <p>
          Share your live location with the user for this pickup. This is optional and will automatically stop after you mark the scrap as picked up.
        </p>
        {error && <div className="notice notice-error">{error}</div>}
        <div className="tracking-modal__actions">
          <Button variant="primary" size="md" loading={loading} onClick={onEnable}>
            Enable Live Tracking
          </Button>
          <Button variant="outline" size="md" disabled={loading} onClick={onSkip}>
            Not Now
          </Button>
        </div>
      </div>
    </div>
  );
}
