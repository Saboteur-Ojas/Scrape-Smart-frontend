import {
  Box,
  Cpu,
  Layers,
  Newspaper,
  Package,
  Recycle,
  ShoppingBag,
} from "lucide-react";
import type { PickupRequest } from "../../types/pickupRequest";
import { buildOptimisedUrl, getPrimaryImageUrl } from "../../services/cloudinaryService";
import { RequestStatusBadge } from "./RequestStatusBadge";

const NAVY = "#393666";
const MUTED = "#7B7A9A";
const GREEN = "#82AA68";

const categoryMeta: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  newspaper: { label: "Newspaper", icon: Newspaper, color: "#F2A65A" },
  cardboard: { label: "Cardboard", icon: Box, color: "#8B6E4E" },
  plastic: { label: "Plastic", icon: ShoppingBag, color: "#5BBFB5" },
  metal: { label: "Metal", icon: Layers, color: "#7B7A9A" },
  e_waste: { label: "E-Waste", icon: Cpu, color: NAVY },
  mixed: { label: "Mixed", icon: Recycle, color: GREEN },
  other: { label: "Other", icon: Package, color: MUTED },
};

function formatDate(ts: unknown) {
  if (!ts) return "";
  const date = ts && typeof ts === "object" && "toDate" in ts
    ? (ts as { toDate(): Date }).toDate()
    : new Date(ts as string | number);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

interface RequestCardProps {
  request: PickupRequest;
  onView?: () => void;
  actions?: React.ReactNode;
  compact?: boolean;
}

export function RequestCard({ request, onView, actions, compact = false }: RequestCardProps) {
  const meta = categoryMeta[request.category] ?? categoryMeta.other;
  const Icon = meta.icon;
  const imageUrl = getPrimaryImageUrl(request.images, request.imageUrls, request.imageUrl);

  return (
    <div className="request-card">
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        {/* Thumbnail / Category icon */}
        <div
          style={{
            width: compact ? 52 : 64,
            height: compact ? 52 : 64,
            borderRadius: 16,
            background: `${meta.color}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {imageUrl ? (
            <img
              src={buildOptimisedUrl(imageUrl)}
              alt={meta.label}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <Icon size={compact ? 22 : 26} color={meta.color} />
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Row 1: category + badge */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: compact ? 13 : 14, fontWeight: 700, color: NAVY }}>
              {meta.label}
            </span>
            <RequestStatusBadge status={request.status} />
          </div>

          {/* Row 2: quantity + area */}
          <div style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>
            {request.quantity} · {request.address.area}, {request.address.city}
          </div>

          {/* AI detected */}
          {request.aiDetectedCategory && (
            <div style={{ fontSize: 11, color: GREEN, marginTop: 3, fontWeight: 600 }}>
              AI: {request.aiDetectedCategory}
            </div>
          )}

          {/* Collector if assigned */}
          {request.collectorName && (
            <div style={{ fontSize: 11, color: NAVY, marginTop: 3 }}>
              Collector: <strong>{request.collectorName}</strong>
            </div>
          )}

          {/* Expected price */}
          {request.expectedPrice != null && (
            <div style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>
              Expected: Rs. {request.expectedPrice}
            </div>
          )}

          {/* Date */}
          <div style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>
            {formatDate(request.createdAt)}
          </div>

          {/* Actions */}
          {(onView || actions) && (
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              {onView && (
                <button
                  onClick={onView}
                  className="btn btn-primary btn-sm"
                >
                  View Details
                </button>
              )}
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
