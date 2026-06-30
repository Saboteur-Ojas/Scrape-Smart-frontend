import { useNavigate } from "react-router";
import {
  ArrowRight,
  CheckCircle2,
  Leaf,
  Package,
  Recycle,
  Truck,
  Users,
} from "lucide-react";
import { Button } from "../components/ui/Button";

const GREEN = "#82AA68";
const NAVY = "#393666";
const MUTED = "#7B7A9A";

function EcoIllustrationCard() {
  return (
    <div
      style={{
        background: "linear-gradient(160deg, #EAF4E0 0%, #F4F1EB 100%)",
        borderRadius: 28,
        padding: 32,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 300,
        gap: 16,
        boxShadow: "0 24px 70px rgba(57,54,102,0.10)",
        border: "1px solid rgba(130,170,104,0.15)",
        position: "relative" as const,
        overflow: "hidden",
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: "rgba(130,170,104,0.1)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -30,
          left: -30,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "rgba(186,185,235,0.15)",
        }}
      />

      {/* Central recycle icon */}
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: 32,
          background: `linear-gradient(135deg, ${GREEN}, #6B9754)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 16px 48px rgba(130,170,104,0.4)`,
          zIndex: 1,
        }}
      >
        <Recycle size={48} color="#fff" strokeWidth={1.8} />
      </div>

      <div style={{ textAlign: "center", zIndex: 1 }}>
        <h3 style={{ fontSize: 20, fontWeight: 800, color: NAVY, margin: "0 0 8px" }}>
          Scrap Pickup Made Easy
        </h3>
        <p style={{ fontSize: 14, color: MUTED, margin: 0, lineHeight: 1.6 }}>
          Connect with scrap collectors near you
        </p>
      </div>

      {/* Mini stat pills */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", zIndex: 1 }}>
        {[
          { label: "500+ Pickups", icon: Package },
          { label: "200+ Collectors", icon: Truck },
          { label: "Eco Friendly", icon: Leaf },
        ].map(({ label, icon: Icon }) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#fff",
              border: "1px solid rgba(57,54,102,0.08)",
              borderRadius: 100,
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 600,
              color: NAVY,
              boxShadow: "0 2px 8px rgba(57,54,102,0.06)",
            }}
          >
            <Icon size={13} color={GREEN} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ background: "linear-gradient(160deg, #EAF4E0 0%, #F4F1EB 60%, #E8E7F6 100%)", minHeight: "100dvh" }}>
      {/* NAV BAR */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(57,54,102,0.06)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 13,
              background: `linear-gradient(135deg, ${GREEN}, #6B9754)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 6px 18px rgba(130,170,104,0.3)`,
            }}
          >
            <Recycle size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: NAVY, lineHeight: 1.2 }}>
              ScrapSmart
            </div>
            <div style={{ fontSize: 10, color: MUTED, fontWeight: 500 }}>Smart Scrap Pickup</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
            Sign In
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate("/register")}>
            Get Started
          </Button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "60px 20px 48px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 48,
            alignItems: "center",
          }}
        >
          {/* Left: Text */}
          <div>
            {/* Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(130,170,104,0.12)",
                border: "1px solid rgba(130,170,104,0.25)",
                borderRadius: 100,
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 600,
                color: "#5A8043",
                marginBottom: 20,
              }}
            >
              <Recycle size={13} />
              India's Smart Scrap Platform
            </div>

            <h1
              style={{
                fontSize: "clamp(32px, 5vw, 56px)",
                fontWeight: 800,
                color: NAVY,
                lineHeight: 1.15,
                letterSpacing: "-0.5px",
                margin: "0 0 18px",
              }}
            >
              Your Scrap Has{" "}
              <span style={{ color: GREEN }}>Real Value.</span>
              <br />
              Let's Collect It.
            </h1>

            <p
              style={{
                fontSize: 16,
                color: MUTED,
                lineHeight: 1.7,
                margin: "0 0 32px",
                maxWidth: 480,
              }}
            >
              Connect with scrap collectors near you. Upload scrap photos,
              let AI detect your scrap type, and schedule a pickup — all in minutes.
            </p>

            {/* CTAs */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate("/register")}
                rightIcon={<ArrowRight size={18} />}
              >
                Sell My Scrap
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/register?role=collector")}
                leftIcon={<Truck size={18} />}
              >
                Join as Collector
              </Button>
            </div>

            {/* Trust indicators */}
            <div
              style={{
                display: "flex",
                gap: 20,
                marginTop: 28,
                flexWrap: "wrap",
              }}
            >
              {[
                { icon: CheckCircle2, text: "Verified Collectors" },
                { icon: Leaf, text: "Eco Friendly" },
                { icon: Users, text: "Free to Use" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    color: MUTED,
                  }}
                >
                  <Icon size={15} color={GREEN} />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Illustration */}
          <div>
            <EcoIllustrationCard />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        style={{
          background: "#fff",
          padding: "60px 20px",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, color: NAVY, margin: "0 0 10px" }}>
              How ScrapSmart Works
            </h2>
            <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>
              Three simple steps to get your scrap picked up
            </p>
          </div>

          <div className="how-it-works-grid">
            {[
              {
                num: "1",
                icon: Package,
                title: "Upload & Detect",
                desc: "Upload photos of your scrap. Our AI instantly detects the type and suggests a fair price.",
                color: GREEN,
                bg: "#EAF4E0",
              },
              {
                num: "2",
                icon: Users,
                title: "Match with Collector",
                desc: "A scrap collector in your area accepts your request and comes to your doorstep.",
                color: "#5BBFB5",
                bg: "#E6F8F7",
              },
              {
                num: "3",
                icon: Leaf,
                title: "Get Paid & Recycle",
                desc: "Collector picks up your scrap, pays you on the spot, and ensures it gets recycled properly.",
                color: "#5A8043",
                bg: "#EAF4E0",
              },
            ].map(({ num, icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="how-card">
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    background: bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    position: "relative" as const,
                  }}
                >
                  <Icon size={26} color={color} />
                  <div
                    className="how-card__number"
                    style={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      width: 22,
                      height: 22,
                      fontSize: 11,
                      borderRadius: 8,
                    }}
                  >
                    {num}
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: "0 0 8px" }}>
                    {title}
                  </h3>
                  <p style={{ fontSize: 14, color: MUTED, margin: 0, lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section style={{ padding: "60px 20px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h2 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, color: NAVY, margin: "0 0 10px" }}>
            Built for Everyone
          </h2>
          <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>
            Whether you're selling scrap or collecting it
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {/* User benefits */}
          <div
            className="card"
            style={{
              background: "linear-gradient(135deg, #EAF4E0 0%, #F0F8E8 100%)",
              border: "1px solid rgba(130,170,104,0.2)",
              boxShadow: "none",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: GREEN,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                boxShadow: `0 6px 18px rgba(130,170,104,0.35)`,
              }}
            >
              <Package size={26} color="#fff" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: "0 0 12px" }}>
              For Scrap Sellers
            </h3>
            {[
              "Free to use — no hidden charges",
              "AI-powered scrap type detection",
              "Fair pricing and transparent process",
              "Track pickup status in real-time",
              "Help the environment with every pickup",
            ].map((item) => (
              <div
                key={item}
                style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}
              >
                <CheckCircle2 size={16} color={GREEN} style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 14, color: NAVY, lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => navigate("/register")}
              style={{ marginTop: 16 }}
            >
              Start Selling Scrap
            </Button>
          </div>

          {/* Collector benefits */}
          <div
            className="card"
            style={{
              background: "linear-gradient(135deg, #EEEDF8 0%, #E8E7F6 100%)",
              border: "1px solid rgba(57,54,102,0.08)",
              boxShadow: "none",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: NAVY,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                boxShadow: "0 6px 18px rgba(57,54,102,0.25)",
              }}
            >
              <Truck size={26} color="#fff" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: "0 0 12px" }}>
              For Scrap Collectors
            </h3>
            {[
              "Get pickup requests in your service area",
              "Manage your availability anytime",
              "Build your reputation with ratings",
              "No middleman — direct user connections",
              "Grow your collection business digitally",
            ].map((item) => (
              <div
                key={item}
                style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}
              >
                <CheckCircle2 size={16} color={NAVY} style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 14, color: NAVY, lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={() => navigate("/register?role=collector")}
              style={{ marginTop: 16 }}
            >
              Join as Collector
            </Button>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section
        style={{
          background: `linear-gradient(135deg, ${GREEN} 0%, #6B9754 100%)`,
          padding: "56px 20px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <Recycle size={48} color="rgba(255,255,255,0.8)" style={{ marginBottom: 16 }} />
          <h2
            style={{
              fontSize: "clamp(24px, 4vw, 36px)",
              fontWeight: 800,
              color: "#fff",
              margin: "0 0 14px",
            }}
          >
            Start Recycling Today
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", margin: "0 0 28px", lineHeight: 1.6 }}>
            Join thousands of households and collectors already using ScrapSmart.
            Your scrap has value — let's make the most of it.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => navigate("/register")}
              style={{ background: "#fff", color: GREEN, fontWeight: 700 }}
            >
              Get Started Free
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => navigate("/login")}
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
                border: "2px solid rgba(255,255,255,0.3)",
              }}
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          background: NAVY,
          padding: "24px 20px",
          textAlign: "center",
          color: "rgba(255,255,255,0.5)",
          fontSize: 13,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
          <Recycle size={16} color={GREEN} />
          <span style={{ fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>ScrapSmart</span>
        </div>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} ScrapSmart. Smart Scrap Pickup.</p>
      </footer>
    </div>
  );
}
