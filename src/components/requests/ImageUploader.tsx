import { Camera, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "../ui/Button";

const MAX_FILES = 5;
const MAX_SIZE_MB = 5;

interface ImageUploaderProps {
  files: File[];
  previews: string[];
  descriptions?: string[];
  onChange: (files: File[], previews: string[]) => void;
  onDescriptionsChange?: (descriptions: string[]) => void;
  error?: string;
}

export function ImageUploader({ files, previews, descriptions = [], onChange, onDescriptionsChange, error }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFiles(incoming: FileList | null) {
    if (!incoming) return;
    const valid: File[] = [];
    const errs: string[] = [];

    Array.from(incoming).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        errs.push(`${file.name}: not an image`);
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        errs.push(`${file.name}: exceeds 5 MB`);
        return;
      }
      valid.push(file);
    });

    const combined = [...files, ...valid].slice(0, MAX_FILES);
    const newPreviews = combined.map((f, i) =>
      i < previews.length && combined[i] === files[i]
        ? previews[i]
        : URL.createObjectURL(f)
    );
    onChange(combined, newPreviews);
    onDescriptionsChange?.(combined.map((_, i) => descriptions[i] ?? ""));
  }

  function removeFile(index: number) {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    const newDescriptions = descriptions.filter((_, i) => i !== index);
    onChange(newFiles, newPreviews);
    onDescriptionsChange?.(newDescriptions);
  }

  function updateDescription(index: number, value: string) {
    const next = files.map((_, i) => (i === index ? value.slice(0, 160) : descriptions[i] ?? ""));
    onDescriptionsChange?.(next);
  }

  return (
    <div>
      {/* Drop zone */}
      <label
        className={`image-drop-zone ${dragOver ? "dragover" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        style={{ cursor: "pointer" }}
      >
        <Camera size={32} color="#82AA68" />
        <span style={{ fontSize: 14, fontWeight: 600, color: "#393666" }}>
          {files.length === 0 ? "Tap to upload scrap photos" : `${files.length} photo${files.length > 1 ? "s" : ""} selected`}
        </span>
        <span style={{ fontSize: 12, color: "#7B7A9A" }}>
          JPG, PNG, WEBP · Max 5 MB each · Up to {MAX_FILES} images
        </span>
        <input
          ref={inputRef}
          hidden
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>

      {/* Preview thumbnails */}
      {previews.length > 0 && (
        <div className="image-preview-grid" style={{ marginTop: 12 }}>
          {previews.map((src, i) => (
            <div key={i} className="image-preview-item">
              <img src={src} alt={`Scrap image ${i + 1}`} />
              <button
                type="button"
                className="image-preview-remove"
                onClick={() => removeFile(i)}
                aria-label={`Remove image ${i + 1}`}
              >
                <X size={12} color="#fff" />
              </button>
              {onDescriptionsChange && (
                <input
                  className="image-caption-input"
                  value={descriptions[i] ?? ""}
                  onChange={(e) => updateDescription(i, e.target.value)}
                  placeholder="Caption"
                  aria-label={`Image ${i + 1} caption`}
                />
              )}
            </div>
          ))}
          {files.length < MAX_FILES && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              style={{
                aspectRatio: "1",
                borderRadius: 14,
                border: "2px dashed #BAB9EB",
                background: "rgba(186,185,235,0.05)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                cursor: "pointer",
                color: "#7B7A9A",
                fontSize: 11,
                fontWeight: 600,
                minHeight: 44,
              }}
            >
              <Camera size={18} color="#BAB9EB" />
              Add
            </button>
          )}
        </div>
      )}

      {error && <p className="form-error" style={{ marginTop: 8 }}>{error}</p>}

      {files.length > 0 && (
        <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => { onChange([], []); onDescriptionsChange?.([]); }}
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
