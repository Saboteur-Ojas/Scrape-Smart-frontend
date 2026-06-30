import {
  Box,
  Bot,
  Clock,
  Cpu,
  Home,
  Layers,
  MapPin,
  Newspaper,
  Package,
  Recycle,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { AIDetectionCard } from "../../components/ai/AIDetectionCard";
import { AppLayout } from "../../components/layout/AppLayout";
import { ImageUploader } from "../../components/requests/ImageUploader";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { useAuth } from "../../context/AuthContext";
import { detectScrapFromImage } from "../../services/aiService";
import { createPickupRequest } from "../../services/pickupRequestService";
import { uploadScrapImagesToCloudinary } from "../../services/cloudinaryService";
import type { AIDetectionResult } from "../../types/aiDetection";
import type { ScrapImage } from "../../types/cloudinary";
import type { ScrapCategory } from "../../types/pickupRequest";
import { getErrorMessage } from "../../utils/errors";
import { requireText } from "../../utils/validation";

const NAVY = "#393666";
const MUTED = "#7B7A9A";
const GREEN = "#82AA68";

const categoryOptions: { value: ScrapCategory; label: string; icon: React.ElementType; color: string }[] = [
  { value: "newspaper", label: "Newspaper", icon: Newspaper, color: "#F2A65A" },
  { value: "cardboard", label: "Cardboard", icon: Box, color: "#8B6E4E" },
  { value: "plastic", label: "Plastic", icon: ShoppingBag, color: "#5BBFB5" },
  { value: "metal", label: "Metal", icon: Layers, color: "#7B7A9A" },
  { value: "e_waste", label: "E-Waste", icon: Cpu, color: NAVY },
  { value: "mixed", label: "Mixed", icon: Recycle, color: GREEN },
  { value: "other", label: "Other", icon: Package, color: MUTED },
];

export function CreateRequestPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [imageDescriptions, setImageDescriptions] = useState<string[]>([]);
  const [images, setImages] = useState<ScrapImage[]>([]);
  const [category, setCategory] = useState<ScrapCategory>("newspaper");
  const [quantity, setQuantity] = useState("5-15 kg");
  const [description, setDescription] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState(profile?.city ?? "");
  const [area, setArea] = useState(profile?.area ?? "");
  const [expectedPrice, setExpectedPrice] = useState("");
  const [ai, setAi] = useState<AIDetectionResult | null>(null);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function uploadIfNeeded(): Promise<ScrapImage[] | null> {
    if (images.length > 0) return images;
    if (files.length === 0) {
      setError("Please upload at least one scrap image.");
      return null;
    }
    if (!profile) return null;
    setLoadingMsg("Uploading images to Cloudinary...");
    const uploadedImages = await uploadScrapImagesToCloudinary(files, profile.uid, imageDescriptions);
    setImages(uploadedImages);
    setLoadingMsg("");
    return uploadedImages;
  }

  async function runAI() {
    if (!profile) return;
    setError("");
    setLoadingMsg("Detecting scrap with AI...");
    try {
      const uploadedImages = await uploadIfNeeded();
      if (!uploadedImages?.[0]?.url) return;
      const result = await detectScrapFromImage(uploadedImages[0].url);
      setAi(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingMsg("");
    }
  }

  function useAIResult() {
    if (!ai) return;
    setCategory(ai.detectedCategory);
    setDescription(ai.suggestedDescription);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setError("");
    try {
      requireText(quantity, "Quantity");
      requireText(description, "Description");
      requireText(addressLine, "Address line");
      requireText(city, "City");
      requireText(area, "Area");
      const uploadedImages = await uploadIfNeeded();
      if (!uploadedImages?.length) return;
      setLoadingMsg("Creating your request...");
      await createPickupRequest({
        userId: profile.uid,
        userName: profile.name,
        userPhone: profile.phone,
        category,
        aiDetectedCategory: ai?.detectedCategory,
        aiConfidence: ai?.confidence,
        aiNotes: ai?.notes,
        quantity,
        description,
        images: uploadedImages,
        address: { line: addressLine, city, area, lat: null, lng: null },
        expectedPrice: expectedPrice ? Number(expectedPrice) : null,
      });
      setSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingMsg("");
    }
  }

  if (success) {
    return (
      <AppLayout title="Create Request">
        <div className="page-container" style={{ textAlign: "center", paddingTop: 60 }}>
          <div style={{ width: 88, height: 88, borderRadius: 28, background: "#EAF4E0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 8px 32px rgba(130,170,104,0.2)" }}>
            <Recycle size={44} color={GREEN} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: NAVY, margin: "0 0 10px" }}>Request Created!</h2>
          <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.6, margin: "0 auto 28px", maxWidth: 320 }}>
            Your scrap pickup request has been submitted. A collector in your city can accept it soon.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Button variant="primary" size="md" onClick={() => navigate("/user/requests")}>
              View My Requests
            </Button>
            <Button variant="outline" size="md" onClick={() => { setSuccess(false); setFiles([]); setPreviews([]); setImageDescriptions([]); setImages([]); setAi(null); setDescription(""); setAddressLine(""); }}>
              Create Another
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const rightPanel = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Category */}
      <div>
        <div className="form-label" style={{ marginBottom: 10 }}>Scrap Category</div>
        <div className="category-grid">
          {categoryOptions.map(({ value, icon: Icon, label, color }) => (
            <button
              key={value}
              type="button"
              className={`category-btn ${category === value ? "active" : ""}`}
              onClick={() => setCategory(value)}
              style={{
                background: category === value ? color : "#fff",
                borderColor: category === value ? color : "rgba(57,54,102,0.08)",
                color: category === value ? "#fff" : NAVY,
              }}
            >
              <Icon size={20} color={category === value ? "#fff" : color} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Quantity"
        type="text"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        placeholder="e.g. 5-15 kg or 3 bags"
        leftIcon={<Package size={17} />}
      />

      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value.slice(0, 500))}
        placeholder="Describe the scrap type, condition, any special notes..."
        rows={3}
        maxChars={500}
        currentLength={description.length}
      />

      <Input
        label="Address Line"
        type="text"
        value={addressLine}
        onChange={(e) => setAddressLine(e.target.value)}
        placeholder="12, Shivaji Nagar, Near Bus Stop"
        leftIcon={<Home size={17} />}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Input
          label="City"
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Pune"
          leftIcon={<MapPin size={17} />}
        />
        <Input
          label="Area"
          type="text"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          placeholder="Kothrud"
          leftIcon={<MapPin size={17} />}
        />
      </div>

      <Input
        label="Expected Price (Optional)"
        type="number"
        value={expectedPrice}
        onChange={(e) => setExpectedPrice(e.target.value)}
        placeholder="Rs. 250"
        hint="Leave blank if unsure; collector will decide"
        leftIcon={<TrendingUp size={17} />}
      />
    </div>
  );

  return (
    <AppLayout title="Create Request">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Create Pickup Request</h1>
          <p className="page-subtitle">Upload photos, detect with AI, then submit your request</p>
        </div>

        {error && (
          <div className="notice notice-error" style={{ marginBottom: 16, borderRadius: 14 }}>
            {error}
          </div>
        )}
        {loadingMsg && (
          <div className="notice notice-info" style={{ marginBottom: 16, borderRadius: 14 }}>
            <Clock size={15} /> {loadingMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Desktop: two column; Mobile: stacked */}
          <div className="detail-layout">
            {/* Left / Top: Images + AI */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="card">
                <div className="form-label" style={{ marginBottom: 12 }}>Scrap Photos</div>
                <ImageUploader
                  files={files}
                  previews={previews}
                  descriptions={imageDescriptions}
                  onDescriptionsChange={setImageDescriptions}
                  onChange={(f, p) => { setFiles(f); setPreviews(p); setImages([]); }}
                  error={files.length === 0 && error.includes("image") ? error : undefined}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  fullWidth
                  style={{ marginTop: 14 }}
                  disabled={files.length === 0 || !!loadingMsg}
                  loading={loadingMsg === "Detecting scrap with AI..."}
                  onClick={runAI}
                  leftIcon={<Bot size={17} />}
                >
                  Detect Scrap with AI
                </Button>
              </div>

              {ai && (
                <AIDetectionCard
                  result={ai}
                  onUseResult={useAIResult}
                  onEditManually={() => setAi(null)}
                />
              )}
            </div>

            {/* Right / Bottom: Form */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="card">
                {rightPanel}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={!!loadingMsg && loadingMsg.includes("Creating")}
                disabled={!!loadingMsg}
              >
                Submit Pickup Request
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
