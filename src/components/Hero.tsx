import { useConnect, useConnectors } from "wagmi";

export default function Hero() {
  const { connect } = useConnect();
  const connectors = useConnectors();

  function handleLaunch() {
    const injected = connectors[0];
    if (injected) connect({ connector: injected });
  }

  return (
    <section
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Vertical divider line */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "10%",
          bottom: "10%",
          width: 1,
          background:
            "linear-gradient(to bottom, transparent, var(--border) 30%, var(--border) 70%, transparent)",
          zIndex: 1,
        }}
      />

      {/* LEFT: headline + CTA */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "100px 60px 60px",
        }}
      >
        {/* Eyebrow */}
        <div
          className="fade-up"
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "var(--gold)",
            marginBottom: 32,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span
            style={{
              display: "block",
              width: 32,
              height: 1,
              background: "var(--gold)",
              flexShrink: 0,
            }}
          />
          Yield Aggregator · Ethereum Mainnet
        </div>

        {/* Headline */}
        <h1
          className="fade-up fade-up-1"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(72px, 8vw, 120px)",
            lineHeight: 0.9,
            letterSpacing: 2,
            marginBottom: 40,
          }}
        >
          YIELD MADE <br />
          SIMPLER<span style={{ color: "var(--gold)" }}>.</span>
        </h1>

        {/* Subtitle */}
        <p
          className="fade-up fade-up-2"
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: "var(--text)",
            maxWidth: 420,
            marginBottom: 16,
          }}
        >
          One deposit. Four protocols. Zero trust required.
        </p>

        {/* Body */}
        <p
          className="fade-up fade-up-2"
          style={{
            fontSize: 15,
            lineHeight: 1.8,
            color: "var(--muted)",
            maxWidth: 420,
            marginBottom: 56,
          }}
        >
          Built for those who verify, not trust. VynX automates yield across
          Lido, Aave, Curve and Uniswap V3 — every decision on-chain, every line
          of code open source. Precision engineering, no noise.
        </p>

        {/* CTAs */}
        <div
          className="fade-up fade-up-3"
          style={{ display: "flex", alignItems: "center", gap: 24 }}
        >
          <button
            onClick={handleLaunch}
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "var(--bg)",
              background: "var(--gold)",
              border: "none",
              padding: "16px 40px",
              cursor: "pointer",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Launch App →
          </button>
          <button
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "var(--muted)",
              background: "none",
              border: "1px solid var(--border)",
              padding: "16px 40px",
              cursor: "pointer",
              transition: "color 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text)";
              e.currentTarget.style.borderColor = "var(--text)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--muted)";
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            Read Docs
          </button>
        </div>
      </div>

      {/* RIGHT: photo */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #111114 0%, #0d0d10 100%)",
        }}
      >
        {/* Photo */}
        <img
          src="/src/assets/profile.jpg"
          alt="Cristian Risueño"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center center",
            display: "block",
            zIndex: 1,
          }}
          onError={(e) => {
            // Show geometric placeholder if image is missing
            e.currentTarget.style.display = "none";
          }}
        />

        {/* Geometric placeholder (shown when image missing) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 0,
          }}
        >
          <div
            style={{
              width: 420,
              height: 420,
              border: "1px solid var(--border)",
              borderRadius: "50%",
              position: "absolute",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 40,
                border: "1px solid var(--border)",
                borderRadius: "50%",
              }}
            />
          </div>
          <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                letterSpacing: 3,
                color: "var(--muted)",
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              foto-cristian.jpg
            </div>
            <div
              style={{
                width: 180,
                height: 260,
                border: "1px solid var(--border)",
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  color: "var(--border)",
                  fontSize: 11,
                  fontFamily: "'DM Mono', monospace",
                  letterSpacing: 2,
                }}
              >
                Add photo
              </span>
            </div>
          </div>
        </div>

        {/* Bottom fade to --bg */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 200,
            background: "linear-gradient(to top, var(--bg), transparent)",
            zIndex: 2,
          }}
        />

        {/* Photo label */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 60,
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "var(--muted)",
            zIndex: 3,
          }}
        >
          From a punk for cypherpunks
        </div>
      </div>
    </section>
  );
}
