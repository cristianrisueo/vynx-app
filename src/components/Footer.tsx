export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        padding: "40px 60px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 20,
          letterSpacing: 4,
          color: "var(--text)",
        }}
      >
        VYN<span style={{ color: "var(--gold)" }}>X</span>
      </div>

      {/* Credits */}
      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 10,
          letterSpacing: 1,
          color: "var(--muted)",
        }}
      >
        Built by <a href="https://github.com/cristianrisueo">@cristianrisueo</a>{" "}
        · Open source · Permissionless
      </div>

      {/* Network */}
      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 10,
          letterSpacing: 1,
          color: "var(--muted)",
        }}
      >
        Ethereum Mainnet · 2026
      </div>
    </footer>
  );
}
