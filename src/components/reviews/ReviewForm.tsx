import { Star } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/Button";
import { Textarea } from "../ui/Textarea";
import { validateRating } from "../../utils/validation";
import { getErrorMessage } from "../../utils/errors";

interface ReviewFormProps {
  onSubmit: (rating: number, comment: string) => Promise<void>;
}

export function ReviewForm({ onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="notice notice-success" style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 16, padding: 16 }}>
        <Star size={18} fill="#82AA68" color="#82AA68" />
        <span>Thank you! Your review has been submitted.</span>
      </div>
    );
  }

  async function handleSubmit() {
    setError("");
    try {
      validateRating(rating);
      setLoading(true);
      await onSubmit(rating, comment);
      setDone(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Star rating */}
      <div className="form-label" style={{ marginBottom: 8 }}>
        Rate your experience
      </div>
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="star-btn"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(star)}
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              size={30}
              color="#F2A65A"
              fill={(hover || rating) >= star ? "#F2A65A" : "transparent"}
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>

      {rating > 0 && (
        <p style={{ fontSize: 12, color: "#7B7A9A", margin: "0 0 14px" }}>
          {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
        </p>
      )}

      <Textarea
        label="Comment (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value.slice(0, 300))}
        placeholder="How was the pickup experience?"
        rows={3}
        maxChars={300}
        currentLength={comment.length}
      />

      {error && <p className="form-error">{error}</p>}

      <Button
        variant="primary"
        size="md"
        fullWidth
        loading={loading}
        disabled={rating === 0}
        onClick={handleSubmit}
      >
        Submit Review
      </Button>
    </div>
  );
}
