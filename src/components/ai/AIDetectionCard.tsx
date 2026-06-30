import { Bot, CheckCircle2, ChevronRight } from "lucide-react";
import type { AIDetectionResult } from "../../types/aiDetection";
import { Button } from "../ui/Button";

const categoryLabels: Record<string, string> = {
  newspaper: "Newspaper",
  cardboard: "Cardboard",
  plastic: "Plastic",
  metal: "Metal",
  e_waste: "E-Waste",
  mixed: "Mixed Scrap",
  other: "Other",
};

interface AIDetectionCardProps {
  result: AIDetectionResult;
  onUseResult: () => void;
  onEditManually: () => void;
}

export function AIDetectionCard({ result, onUseResult, onEditManually }: AIDetectionCardProps) {
  const pct = Math.round(result.confidence * 100);
  const label = categoryLabels[result.detectedCategory] ?? result.detectedCategory;

  return (
    <div className="ai-card">
      {/* Header */}
      <div className="ai-card__header">
        <span className="ai-card__badge">
          <Bot size={13} />
          AI Detection Result
        </span>
      </div>

      {/* Detected category */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 11, color: "#7B7A9A", fontWeight: 500 }}>Detected Category</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#393666", marginTop: 2 }}>
            {label}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "#7B7A9A", fontWeight: 500 }}>Confidence</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#82AA68" }}>{pct}%</div>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="ai-confidence-bar">
        <div className="ai-confidence-bar__fill" style={{ width: `${pct}%` }} />
      </div>

      {/* Notes */}
      {result.notes && (
        <p style={{ fontSize: 13, color: "#393666", margin: "10px 0 4px", lineHeight: 1.5 }}>
          {result.notes}
        </p>
      )}

      {/* Suggested description */}
      {result.suggestedDescription && (
        <div
          style={{
            background: "rgba(130,170,104,0.1)",
            borderRadius: 12,
            padding: "10px 12px",
            marginTop: 8,
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 11, color: "#5A8043", fontWeight: 700, marginBottom: 4 }}>
            Suggested Description
          </div>
          <p style={{ fontSize: 13, color: "#393666", margin: 0, lineHeight: 1.5 }}>
            {result.suggestedDescription}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
        <Button
          variant="primary"
          size="sm"
          onClick={onUseResult}
          leftIcon={<CheckCircle2 size={15} />}
        >
          Use AI Result
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onEditManually}
          rightIcon={<ChevronRight size={15} />}
        >
          Edit Manually
        </Button>
      </div>
    </div>
  );
}
