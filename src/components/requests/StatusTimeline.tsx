import { Check, Circle } from "lucide-react";
import type { PickupStatus } from "../../types/pickupRequest";

const GREEN = "#82AA68";
const MUTED = "#7B7A9A";
const LAVENDER = "#BAB9EB";
const NAVY = "#393666";

interface StatusTimelineProps {
  status: PickupStatus;
}

const steps: { status: PickupStatus; label: string; sublabel: string }[] = [
  { status: "open", label: "Request Submitted", sublabel: "Waiting for a collector" },
  { status: "accepted", label: "Accepted by Collector", sublabel: "Collector is on the way" },
  { status: "completed", label: "Pickup Completed", sublabel: "All done! Thanks for recycling" },
];

const statusOrder: PickupStatus[] = ["open", "accepted", "completed"];

export function StatusTimeline({ status }: StatusTimelineProps) {
  if (status === "cancelled") {
    return (
      <div className="notice notice-error">
        This pickup request was cancelled.
      </div>
    );
  }

  const activeIndex = statusOrder.indexOf(status);

  return (
    <div className="timeline">
      {steps.map((step, index) => {
        const isDone = index <= activeIndex;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.status} className="timeline__step">
            <div className="timeline__rail">
              <div
                className={`timeline__dot ${isDone ? "done" : "todo"}`}
                style={isDone ? { background: GREEN } : { background: "#F3F3F3", border: `2px solid ${LAVENDER}` }}
              >
                {isDone ? (
                  <Check size={14} color="#fff" strokeWidth={3} />
                ) : (
                  <Circle size={10} color={MUTED} />
                )}
              </div>
              {!isLast && (
                <div
                  className={`timeline__line ${index < activeIndex ? "done" : "todo"}`}
                />
              )}
            </div>
            <div className="timeline__content">
              <div style={{ fontSize: 13, fontWeight: 600, color: isDone ? NAVY : MUTED }}>
                {step.label}
              </div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                {step.sublabel}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
