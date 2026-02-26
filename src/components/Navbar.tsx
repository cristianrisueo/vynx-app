import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export default function Navbar() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [menuOpen, setMenuOpen] = useState(false);

  const shortAddress = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : null;

  function handleLaunch() {
    if (isConnected) {
      setMenuOpen((v) => !v);
    } else {
      const injected = connectors[0];
      if (injected) connect({ connector: injected });
    }
  }

  return (
    <nav
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "28px 60px",
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 38,
          letterSpacing: 4,
          color: "var(--text)",
        }}
      >
        VYN<span style={{ color: "var(--gold)" }}>X</span>
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
        <a
          href="#"
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 12,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "var(--muted)",
            textDecoration: "none",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) =>
            ((e.target as HTMLElement).style.color = "var(--text)")
          }
          onMouseLeave={(e) =>
            ((e.target as HTMLElement).style.color = "var(--muted)")
          }
        >
          Docs
        </a>
        <a
          href="#"
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 12,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "var(--muted)",
            textDecoration: "none",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) =>
            ((e.target as HTMLElement).style.color = "var(--text)")
          }
          onMouseLeave={(e) =>
            ((e.target as HTMLElement).style.color = "var(--muted)")
          }
        >
          GitHub
        </a>

        <div style={{ position: "relative" }}>
          <button
            onClick={handleLaunch}
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: isConnected ? "var(--muted)" : "var(--bg)",
              background: isConnected ? "none" : "var(--gold)",
              border: isConnected ? "1px solid var(--border)" : "none",
              padding: "12px 28px",
              cursor: "pointer",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            {isConnected ? shortAddress : "Launch App"}
          </button>

          {/* Disconnect dropdown */}
          {isConnected && menuOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                minWidth: 140,
                zIndex: 60,
              }}
            >
              <button
                onClick={() => {
                  disconnect();
                  setMenuOpen(false);
                }}
                style={{
                  width: "100%",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 11,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  background: "none",
                  border: "none",
                  padding: "14px 20px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--text)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--muted)")
                }
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
