import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ─── Internal sub-components ──────────────────────────────────────────────────

const CodeBlock = ({ children }: { children: React.ReactNode }) => (
  <pre className="bg-vynx-surface border border-vynx-border rounded p-4 font-mono text-xs text-vynx-muted overflow-x-auto leading-relaxed whitespace-pre-wrap">
    <code>{children}</code>
  </pre>
);

const SectionTag = ({ label }: { label: string }) => (
  <span className="font-mono text-[10px] uppercase tracking-[3px] text-vynx-gold">
    {label}
  </span>
);

const StatusBadge = ({ label = "Active" }: { label?: string }) => (
  <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-vynx-green">
    <span className="w-1.5 h-1.5 rounded-full bg-vynx-green inline-block shrink-0" />
    {label}
  </span>
);

const WarningBadge = ({ label = "Note" }: { label?: string }) => (
  <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-vynx-gold">
    <span className="w-1.5 h-1.5 rounded-full bg-vynx-gold inline-block shrink-0" />
    {label}
  </span>
);

// ─── Section map ──────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: "overview", title: "Protocol Overview" },
  { id: "architecture", title: "Architecture" },
  { id: "strategies", title: "Yield Strategies" },
  { id: "router", title: "Router Periphery" },
  { id: "security", title: "Security Model" },
  { id: "contracts", title: "Contract Registry" },
  { id: "tests", title: "Test Suite" },
];

// ─── Address helper ───────────────────────────────────────────────────────────

const Addr = ({ address }: { address: string }) => (
  <a
    href={`https://etherscan.io/address/${address.toLowerCase()}`}
    target="_blank"
    rel="noopener noreferrer"
    className="font-mono text-xs text-vynx-muted hover:text-vynx-text underline decoration-vynx-border underline-offset-4 transition-colors"
  >
    {address}
  </a>
);

// ─── Heading helper ───────────────────────────────────────────────────────────

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2
    style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "3px" }}
    className="text-4xl text-vynx-text"
  >
    {children}
  </h2>
);

// ─── Main component ───────────────────────────────────────────────────────────

export default function Docs({
  setPage,
}: {
  setPage?: (page: "home" | "docs") => void;
}) {
  const [activeSection, setActiveSection] = useState<string>("overview");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -80% 0px" },
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-vynx-bg text-vynx-muted font-sans selection:bg-vynx-surface selection:text-vynx-text flex flex-col">
      <Navbar onLogoClick={setPage ? () => setPage("home") : undefined} />

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 md:px-12 py-24 flex flex-col md:flex-row gap-16 relative">
        {/* ── Sticky sidebar ── */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="sticky top-32">
            <ul className="space-y-4 border-l border-vynx-border">
              {SECTIONS.map(({ id, title }) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className={`block pl-4 text-sm font-mono transition-colors duration-200 ${
                      activeSection === id
                        ? "text-vynx-gold border-l-2 border-vynx-gold -ml-[1px]"
                        : "hover:text-vynx-text"
                    }`}
                  >
                    {title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 max-w-3xl space-y-32">
          {/* ──────────────────────────────────────────────────────────── */}
          {/* 1. OVERVIEW                                                  */}
          {/* ──────────────────────────────────────────────────────────── */}
          <section id="overview" className="scroll-mt-32 space-y-8">
            <div className="space-y-4">
              <h1
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  letterSpacing: "4px",
                }}
                className="text-5xl md:text-6xl text-vynx-text mt-6"
              >
                Protocol Documentation
              </h1>
              <p className="text-vynx-text leading-relaxed max-w-2xl">
                VynX is an ERC-4626 yield aggregator that accepts WETH deposits
                and distributes capital across battle-tested DeFi protocols —
                Lido, Aave v3, Curve, and Uniswap V3 — in two independent risk
                tiers. Weighted allocation, automatic rebalancing, and
                auto-compounding. No governance. No noise.
              </p>
            </div>

            {/* Metrics strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-vynx-border border border-vynx-border rounded overflow-hidden">
              {[
                { label: "Risk Tiers", value: "2" },
                { label: "Integrated Protocols", value: "4" },
                { label: "Total Tests", value: "160" },
                { label: "Line Coverage", value: "85.42%" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="bg-vynx-bg px-5 py-4 flex flex-col gap-1"
                >
                  <span
                    className="font-mono text-vynx-gold"
                    style={{ fontSize: "1.5rem", lineHeight: 1 }}
                  >
                    {value}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-vynx-muted">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Stack badges */}
            <div className="flex flex-wrap gap-2">
              {["Ethereum Mainnet", "Foundry", "OpenZeppelin"].map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[10px] uppercase tracking-wider px-3 py-1 border border-vynx-border text-vynx-muted rounded"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Unaudited disclaimer */}
            <div className="border-l-2 border-vynx-gold pl-4 py-2 space-y-1">
              <WarningBadge label="Unaudited Project" />
              <p className="text-sm text-vynx-muted">
                This protocol is{" "}
                <span className="text-vynx-text">unaudited</span> and it was
                built for educational purposes. It has been tested on Mainnet
                with my own funds and every test has been passed following the
                mainnet forks, but use at your own risk. If the project gains
                traction, it will be audited by Cyfrin as soon as treasury funds
                allows it.
              </p>
            </div>

            {/* GitHub link */}
            <div className="flex items-center gap-3 text-sm border border-vynx-border rounded px-4 py-3 bg-vynx-surface/20">
              <span className="font-mono text-[10px] uppercase tracking-wider text-vynx-muted shrink-0">
                Full docs
              </span>
              <span className="text-vynx-border">·</span>
              <a
                href="https://github.com/cristianrisueo/vynx"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-vynx-gold hover:underline underline-offset-4 decoration-vynx-gold/50 transition-colors"
              >
                github.com/cristianrisueo/vynx
              </a>
              <span className="font-mono text-[10px] text-vynx-muted">
                /docs/
              </span>
            </div>
          </section>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* 2. ARCHITECTURE                                              */}
          {/* ──────────────────────────────────────────────────────────── */}
          <section id="architecture" className="scroll-mt-32 space-y-8">
            <div className="space-y-2">
              <SectionTag label="System Design" />
              <H2>Architecture</H2>
            </div>

            {/* Flow diagram */}
            <CodeBlock>
              {`User
 │
 ├─ Direct ──► Vault ──► StrategyManager ──► LidoStrategy    ──► Lido stETH
 │                                       ├─► AaveStrategy   ──► Aave v3 (wstETH)
 │                                       ├─► CurveStrategy  ──► Curve stETH/ETH
 │                                       └─► UniV3Strategy  ──► Uniswap V3 WETH/USDC
 │
 └─ Via Router ──► [ERC20/ETH → WETH swap] ──► Vault`}
            </CodeBlock>

            {/* StrategyManager */}
            <div className="space-y-3">
              <h3 className="text-vynx-text font-mono text-sm uppercase tracking-widest">
                StrategyManager
              </h3>
              <p className="text-sm leading-relaxed">
                The{" "}
                <span className="font-mono text-vynx-text">
                  StrategyManager
                </span>{" "}
                is the allocation engine. It has no external user-facing
                interface — only the Vault calls it. Its responsibilities:
              </p>
              <ul className="space-y-2 text-sm">
                {[
                  {
                    fn: "allocate(uint256 amount)",
                    desc: "Reads the APY of each registered strategy, computes a weighted target allocation proportional to APY, and pushes capital into strategies that are under-allocated.",
                  },
                  {
                    fn: "withdrawTo(uint256 amount)",
                    desc: "Pulls capital from over-allocated strategies in priority order to cover a withdrawal request from the Vault.",
                  },
                  {
                    fn: "rebalance()",
                    desc: "Redistributes capital among strategies when the APY spread exceeds the configured rebalance_threshold. Caller (keeper) may receive a 1% WETH incentive.",
                  },
                  {
                    fn: "harvest()",
                    desc: "Triggers harvest() on each strategy inside a try-catch block. CRV and fee rewards are swapped to WETH via Uniswap V3 and reinvested.",
                  },
                  {
                    fn: "shouldRebalance() → bool",
                    desc: "View function. Returns true if the max APY difference across strategy pairs ≥ rebalance_threshold AND TVL ≥ min_tvl_for_rebalance. Used by off-chain keepers.",
                  },
                ].map(({ fn, desc }) => (
                  <li key={fn} className="flex gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-vynx-border mt-2 shrink-0" />
                    <span>
                      <span className="font-mono text-vynx-gold text-xs">
                        {fn}
                      </span>
                      <span className="text-vynx-muted"> — {desc}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Idle buffer */}
            <div className="space-y-3">
              <h3 className="text-vynx-text font-mono text-sm uppercase tracking-widest">
                Idle Buffer & Allocation Trigger
              </h3>
              <p className="text-sm leading-relaxed">
                Every deposit lands in the Vault's internal{" "}
                <span className="font-mono text-vynx-text">idle_buffer</span>{" "}
                first. Capital is not immediately deployed to strategies — it
                accumulates until the threshold is met. This amortizes gas costs
                across multiple user deposits.
              </p>
              <CodeBlock>
                {`// Triggered at the end of every deposit
function _allocateIdle() internal {
    if (idle_buffer >= idle_threshold) {
        manager.allocate(idle_buffer);
        idle_buffer = 0;
    }
}`}
              </CodeBlock>
              <div className="overflow-x-auto rounded border border-vynx-border">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-vynx-surface border-b border-vynx-border">
                      <th className="p-3 font-mono text-[11px] uppercase tracking-wider text-vynx-muted">
                        Tier
                      </th>
                      <th className="p-3 font-mono text-[11px] uppercase tracking-wider text-vynx-muted">
                        idle_threshold
                      </th>
                      <th className="p-3 font-mono text-[11px] uppercase tracking-wider text-vynx-muted">
                        min_tvl_for_rebalance
                      </th>
                      <th className="p-3 font-mono text-[11px] uppercase tracking-wider text-vynx-muted">
                        min_profit_for_harvest
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-vynx-border font-mono text-xs">
                    <tr className="hover:bg-vynx-surface/40 transition-colors">
                      <td className="p-3 text-vynx-text">Balanced</td>
                      <td className="p-3 text-vynx-gold">8 ETH</td>
                      <td className="p-3 text-vynx-muted">8 ETH</td>
                      <td className="p-3 text-vynx-muted">0.08 ETH</td>
                    </tr>
                    <tr className="hover:bg-vynx-surface/40 transition-colors">
                      <td className="p-3 text-vynx-text">Aggressive</td>
                      <td className="p-3 text-vynx-gold">12 ETH</td>
                      <td className="p-3 text-vynx-muted">12 ETH</td>
                      <td className="p-3 text-vynx-muted">0.12 ETH</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Rebalance threshold */}
            <div className="space-y-3">
              <h3 className="text-vynx-text font-mono text-sm uppercase tracking-widest">
                Rebalance Threshold Logic
              </h3>
              <p className="text-sm leading-relaxed">
                <span className="font-mono text-vynx-text">
                  shouldRebalance()
                </span>{" "}
                computes the maximum APY difference across all strategy pairs.
                Only if this spread exceeds the tier's configured threshold does
                the system execute capital redistribution. This prevents
                unnecessary gas overhead from micro-rebalances.
              </p>
              <div className="overflow-x-auto rounded border border-vynx-border">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-vynx-surface border-b border-vynx-border">
                      <th className="p-3 font-mono text-[11px] uppercase tracking-wider text-vynx-muted">
                        Tier
                      </th>
                      <th className="p-3 font-mono text-[11px] uppercase tracking-wider text-vynx-muted">
                        rebalance_threshold
                      </th>
                      <th className="p-3 font-mono text-[11px] uppercase tracking-wider text-vynx-muted">
                        max_alloc
                      </th>
                      <th className="p-3 font-mono text-[11px] uppercase tracking-wider text-vynx-muted">
                        min_alloc
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-vynx-border font-mono text-xs">
                    <tr className="hover:bg-vynx-surface/40 transition-colors">
                      <td className="p-3 text-vynx-text">Balanced</td>
                      <td className="p-3 text-vynx-gold">200 bp (2%)</td>
                      <td className="p-3 text-vynx-muted">50%</td>
                      <td className="p-3 text-vynx-muted">20%</td>
                    </tr>
                    <tr className="hover:bg-vynx-surface/40 transition-colors">
                      <td className="p-3 text-vynx-text">Aggressive</td>
                      <td className="p-3 text-vynx-gold">300 bp (3%)</td>
                      <td className="p-3 text-vynx-muted">70%</td>
                      <td className="p-3 text-vynx-muted">10%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Design decisions */}
            <div className="space-y-3">
              <h3 className="text-vynx-text font-mono text-md uppercase tracking-widest mb-8">
                Key Design Decisions
              </h3>
              <div className="space-y-8">

                <div className="space-y-3">
                  <p
                    className="font-mono text-sm uppercase text-vynx-text pb-2"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    Dual Vault Architecture
                  </p>
                  <p className="text-sm text-vynx-muted">
                    Two independent ERC-4626 vaults rather than one vault with a
                    risk parameter. This guarantees full capital isolation
                    between risk tiers: an exploit in an Aggressive strategy
                    cannot affect Balanced depositors. Each vault has its own
                    StrategyManager, its own strategy set, and its own
                    accounting.
                  </p>
                </div>

                <div className="space-y-3">
                  <p
                    className="font-mono text-sm uppercase text-vynx-text pb-2"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    No Harvest for LidoStrategy
                  </p>
                  <p className="text-sm text-vynx-muted">
                    Lido staking yield accrues automatically via the wstETH
                    exchange rate. Each wstETH represents an increasing amount
                    of stETH as validators earn rewards. No explicit{" "}
                    <span className="font-mono text-vynx-text">harvest()</span>{" "}
                    call is needed — calling it returns 0 by design.{" "}
                    <span className="font-mono text-vynx-text">
                      totalAssets()
                    </span>{" "}
                    reads the current exchange rate on-chain to report the
                    correct WETH value.
                  </p>
                </div>

                <div className="space-y-3">
                  <p
                    className="font-mono text-sm uppercase text-vynx-text pb-2"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    wstETH in Aave (Yield Stacking)
                  </p>
                  <p className="text-sm text-vynx-muted">
                    AaveStrategy deposits <em>wstETH</em> (not ETH or WETH) into
                    Aave v3. This stacks two yield sources simultaneously: (1)
                    Lido staking APY via the wstETH exchange rate appreciation,
                    and (2) Aave lending APY from wstETH suppliers. The aToken
                    held by the strategy tracks both yields. Risk trade-off:
                    both Lido and Aave smart contract risk are stacked.
                  </p>
                </div>

                <div className="space-y-3">
                  <p
                    className="font-mono text-sm uppercase text-vynx-text pb-2"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    Peripheral Router (Stateless Design)
                  </p>
                  <p className="text-sm text-vynx-muted">
                    The Router is an immutable, ownerless peripheral contract.
                    It has zero admin privileges over the Vault or Manager.
                    After every function call, it asserts its WETH and ETH
                    balance is 0. If a swap or deposit fails mid-execution, the
                    entire transaction reverts — no partial state is possible.
                    This design keeps the core ERC-4626 vault pure (WETH only)
                    while enabling arbitrary token entry points.
                  </p>
                </div>

                <div className="space-y-3">
                  <p
                    className="font-mono text-sm uppercase text-vynx-text pb-2"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    Keeper Incentive System
                  </p>
                  <p className="text-sm text-vynx-muted">
                    Official keepers (protocol-operated) call{" "}
                    <span className="font-mono text-vynx-text">
                      rebalance()
                    </span>{" "}
                    and{" "}
                    <span className="font-mono text-vynx-text">harvest()</span>{" "}
                    with no incentive. External keepers receive a 1% WETH reward
                    from the harvested yield. The{" "}
                    <span className="font-mono text-vynx-text">
                      min_profit_for_harvest
                    </span>{" "}
                    gate (0.08/0.12 ETH) prevents spam: a harvest only executes
                    if the expected profit exceeds the minimum threshold after
                    accounting for the keeper reward.
                  </p>
                </div>

              </div>
            </div>
          </section>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* 3. YIELD STRATEGIES                                          */}
          {/* ──────────────────────────────────────────────────────────── */}
          <section id="strategies" className="scroll-mt-32 space-y-8">
            <div className="space-y-2">
              <SectionTag label="Risk Tiers" />
              <H2>Yield Strategies</H2>
            </div>

            {/* Tier overview cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 border border-vynx-border rounded bg-vynx-surface/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-vynx-text text-sm">
                    Balanced Tier
                  </span>
                </div>
                <p className="text-xs text-vynx-muted leading-relaxed">
                  Lower risk. Focused on liquid staking and base lending yields.
                  Longer time horizon, reduced volatility.
                </p>
                <div className="font-mono text-[11px] text-vynx-muted space-y-1 border-t border-vynx-border pt-3">
                  <p>› LidoStrategy</p>
                  <p>› AaveStrategy (wstETH)</p>
                  <p>› CurveStrategy (stETH/ETH)</p>
                </div>
              </div>
              <div className="p-5 border border-vynx-border rounded bg-vynx-surface/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-vynx-text text-sm">
                    Aggressive Tier
                  </span>
                </div>
                <p className="text-xs text-vynx-muted leading-relaxed">
                  Higher yield via concentrated liquidity (±10% range). Accepts
                  out-of-range risk and amplified IL.
                </p>
                <div className="font-mono text-[11px] text-vynx-muted space-y-1 border-t border-vynx-border pt-3">
                  <p>› CurveStrategy (stETH/ETH)</p>
                  <p>› UniswapV3Strategy (WETH/USDC ±10%)</p>
                </div>
              </div>
            </div>

            {/* Strategy deep dives */}
            <div className="space-y-3">
              <h3 className="text-vynx-text font-mono text-md uppercase tracking-widest mb-8">
                Strategy Deep Dives
              </h3>
              <div className="space-y-8">
                {/* LidoStrategy */}
                <div className="space-y-3">
                  <p
                    className="font-mono text-sm uppercase text-vynx-text pb-2"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    LidoStrategy — Liquid Staking (Balanced)
                  </p>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong className="text-vynx-text">Flow:</strong> WETH →
                      unwrap to ETH → call{" "}
                      <span className="font-mono">Lido.submit()</span> → receive
                      stETH → wrap to wstETH via{" "}
                      <span className="font-mono">IWstETH.wrap()</span>.
                    </p>
                    <p>
                      <strong className="text-vynx-text">
                        Yield mechanics:
                      </strong>{" "}
                      wstETH appreciates passively against stETH via the
                      exchange rate. No harvest is required — yield is
                      automatically reflected in{" "}
                      <span className="font-mono">totalAssets()</span> when it
                      reads{" "}
                      <span className="font-mono">
                        wstETH.getStETHByWstETH(balance)
                      </span>
                      .
                    </p>
                    <p>
                      <strong className="text-vynx-text">APY:</strong> 4%
                      hardcoded (400 bp). Lido doesn't expose an on-chain APY
                      oracle.
                    </p>
                    <p>
                      <strong className="text-vynx-text">Risks:</strong> stETH
                      depeg (use swap path with slippage guard on withdraw),
                      validator slashing (&lt;0.01% historically).
                    </p>
                  </div>
                </div>

                {/* AaveStrategy */}
                <div className="space-y-3">
                  <p
                    className="font-mono text-sm uppercase text-vynx-text pb-2"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    AaveStrategy — wstETH Lending (Balanced)
                  </p>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong className="text-vynx-text">Flow:</strong> WETH →
                      unwrap to ETH → wrap to wstETH → call{" "}
                      <span className="font-mono">
                        Aave.supply(wstETH, amount, address(this), 0)
                      </span>{" "}
                      → receive awstETH (Aave interest-bearing token).
                    </p>
                    <p>
                      <strong className="text-vynx-text">
                        Yield stacking:
                      </strong>{" "}
                      Double source — (1) Lido staking yield via wstETH exchange
                      rate + (2) Aave lending yield from wstETH borrowing
                      demand. The awstETH balance grows from Aave, while each
                      wstETH is worth more stETH over time.
                    </p>
                    <p>
                      <strong className="text-vynx-text">APY:</strong> Read
                      on-chain from{" "}
                      <span className="font-mono">
                        Aave.getReserveData(wstETH).currentLiquidityRate
                      </span>{" "}
                      (RAY format, converted to bps).
                    </p>
                    <p>
                      <strong className="text-vynx-text">
                        No liquidation risk:
                      </strong>{" "}
                      Supply-only. The strategy never borrows.
                    </p>
                    <p>
                      <strong className="text-vynx-text">Risks:</strong> Stacked
                      smart contract risk (Lido + Aave). Both protocols must
                      remain solvent.
                    </p>
                  </div>
                </div>

                {/* CurveStrategy */}
                <div className="space-y-3">
                  <p
                    className="font-mono text-sm uppercase text-vynx-text pb-2"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    CurveStrategy — stETH/ETH LP + Gauge (Balanced & Aggressive)
                  </p>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong className="text-vynx-text">Flow:</strong> WETH →
                      unwrap to ETH → call{" "}
                      <span className="font-mono">
                        CurvePool.add_liquidity([eth_amount, 0], min_lp_out)
                      </span>{" "}
                      → stake LP tokens in Curve Gauge to accumulate CRV
                      rewards.
                    </p>
                    <p>
                      <strong className="text-vynx-text">Harvest:</strong> Claim
                      CRV from gauge → swap CRV → WETH via Uniswap V3{" "}
                      <span className="font-mono">exactInputSingle</span> →
                      reinvest WETH back into pool.
                    </p>
                    <p>
                      <strong className="text-vynx-text">IL profile:</strong>{" "}
                      Very low. stETH and ETH are highly correlated (1:1 peg
                      target). IL only materializes on significant depeg events.
                    </p>
                    <p>
                      <strong className="text-vynx-text">APY:</strong> Hardcoded
                      approximation (CRV rewards are variable). Does not
                      dynamically read on-chain gauge emissions.
                    </p>
                    <p>
                      <strong className="text-vynx-text">Risks:</strong> Vyper
                      compiler vulnerability (July 2023 gauge exploit —
                      patched). Protocol now requires Vyper ≥ 0.3.1.
                    </p>
                  </div>
                </div>

                {/* UniswapV3Strategy */}
                <div className="space-y-3">
                  <p
                    className="font-mono text-sm uppercase text-vynx-text pb-2"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    UniswapV3Strategy — Concentrated Liquidity WETH/USDC
                    (Aggressive)
                  </p>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong className="text-vynx-text">Flow:</strong> Split
                      WETH into WETH + USDC (swap half via{" "}
                      <span className="font-mono">exactInputSingle</span>) →
                      call{" "}
                      <span className="font-mono">
                        NonfungiblePositionManager.mint()
                      </span>{" "}
                      with ticks computed for ±10% of current price. Strategy
                      holds a single NFT position.
                    </p>
                    <p>
                      <strong className="text-vynx-text">Tick math:</strong>{" "}
                      Uses custom{" "}
                      <span className="font-mono">TickMath.sol</span>,{" "}
                      <span className="font-mono">LiquidityAmounts.sol</span>,
                      and <span className="font-mono">FullMath.sol</span>{" "}
                      libraries to compute sqrtPriceLimitX96 and liquidity from
                      token amounts.
                    </p>
                    <p>
                      <strong className="text-vynx-text">Harvest:</strong> Call{" "}
                      <span className="font-mono">
                        NonfungiblePositionManager.collect()
                      </span>{" "}
                      → receive accumulated WETH + USDC fees → swap USDC → WETH
                      via UniV3 → reinvest into position.
                    </p>
                    <p>
                      <strong className="text-vynx-text">
                        Out-of-range risk:
                      </strong>{" "}
                      If the WETH/USDC price exits the ±10% band, the position
                      becomes single-asset and stops earning fees. This risk is
                      accepted by design in the Aggressive tier.
                    </p>
                    <p>
                      <strong className="text-vynx-text">APY:</strong> Variable
                      (3–10%). Approximated — does not read live fee income
                      on-chain. Harvest frequency determines effective yield.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* 4. ROUTER PERIPHERY                                          */}
          {/* ──────────────────────────────────────────────────────────── */}
          <section id="router" className="scroll-mt-32 space-y-8">
            <div className="space-y-2">
              <SectionTag label="Periphery · Stateless · Ownerless" />
              <H2>Router Periphery</H2>
            </div>

            <p className="text-sm leading-relaxed">
              The Router is an immutable peripheral contract with zero admin
              privileges. It enables multi-token entry and exit for the core
              ERC-4626 vault while keeping the vault itself pure (WETH only).
              The Router never retains funds between transactions — every
              function ends with an internal balance assertion.
            </p>

            {/* Zap deposit */}
            <div className="space-y-3">
              <h3 className="text-vynx-text font-mono text-sm uppercase tracking-widest">
                Zap Deposit Flows
              </h3>
              <div className="space-y-4 text-sm">
                <div className="p-4 border border-vynx-border rounded bg-vynx-surface/20 space-y-2">
                  <p className="font-mono text-vynx-gold text-xs">
                    zapDepositETH() payable → uint256 shares
                  </p>
                  <p className="text-vynx-muted">
                    Accepts native ETH. Internally calls{" "}
                    <span className="font-mono">WETH.deposit{"{value}"}</span>{" "}
                    to wrap, then deposits into the Vault. Caller receives vault
                    shares (vxWETH) directly.
                  </p>
                </div>
                <div className="p-4 border border-vynx-border rounded bg-vynx-surface/20 space-y-2">
                  <p className="font-mono text-vynx-gold text-xs">
                    zapDepositERC20(address token, uint256 amount, uint24 fee,
                    uint256 min_weth_out) → uint256 shares
                  </p>
                  <p className="text-vynx-muted">
                    Pulls <span className="font-mono">amount</span> of{" "}
                    <span className="font-mono">token</span> from caller via{" "}
                    <span className="font-mono">transferFrom</span>. Calls{" "}
                    <span className="font-mono">
                      ISwapRouter.exactInputSingle
                    </span>{" "}
                    with{" "}
                    <span className="font-mono">
                      tokenIn=token, tokenOut=WETH, fee=fee,
                      amountOutMinimum=min_weth_out
                    </span>
                    . Slippage check enforced by the Uniswap router — reverts if
                    output &lt; minimum. Deposits resulting WETH into Vault.
                  </p>
                </div>
              </div>
            </div>

            {/* Zap withdraw */}
            <div className="space-y-3">
              <h3 className="text-vynx-text font-mono text-sm uppercase tracking-widest">
                Zap Withdraw Flows
              </h3>
              <div className="space-y-4 text-sm">
                <div className="p-4 border border-vynx-border rounded bg-vynx-surface/20 space-y-2">
                  <p className="font-mono text-vynx-gold text-xs">
                    zapWithdrawETH(uint256 shares) → uint256 eth_out
                  </p>
                  <p className="text-vynx-muted">
                    Redeems <span className="font-mono">shares</span> from Vault
                    → receives WETH → calls{" "}
                    <span className="font-mono">WETH.withdraw()</span> → sends
                    native ETH to caller.
                  </p>
                </div>
                <div className="p-4 border border-vynx-border rounded bg-vynx-surface/20 space-y-2">
                  <p className="font-mono text-vynx-gold text-xs">
                    zapWithdrawERC20(uint256 shares, address token, uint24 fee,
                    uint256 min_token_out) → uint256 token_out
                  </p>
                  <p className="text-vynx-muted">
                    Redeems shares → WETH → swaps WETH → target token via UniV3{" "}
                    <span className="font-mono">exactInputSingle</span> with{" "}
                    <span className="font-mono">
                      amountOutMinimum=min_token_out
                    </span>
                    . Reverts if output &lt; minimum.
                  </p>
                </div>
              </div>
            </div>

            {/* Slippage */}
            <div className="space-y-3">
              <h3 className="text-vynx-text font-mono text-sm uppercase tracking-widest">
                Slippage Protection
              </h3>
              <p className="text-sm leading-relaxed">
                Slippage protection is caller-specified, not hardcoded in the
                Router. The{" "}
                <span className="font-mono text-vynx-text">min_weth_out</span>{" "}
                and{" "}
                <span className="font-mono text-vynx-text">min_token_out</span>{" "}
                parameters map directly to{" "}
                <span className="font-mono text-vynx-text">
                  amountOutMinimum
                </span>{" "}
                in{" "}
                <span className="font-mono text-vynx-text">
                  ISwapRouter.ExactInputSingleParams
                </span>
                . Recommended approach: fetch a live quote via the Uniswap
                Quoter contract off-chain, then apply a 1% tolerance. Setting{" "}
                <span className="font-mono text-vynx-text">min_weth_out=0</span>{" "}
                disables protection and exposes the transaction to full MEV
                sandwich risk.
              </p>
              <CodeBlock>
                {`// Example: deposit USDC with 1% slippage tolerance
uint256 quotedWeth = quoter.quoteExactInputSingle(
    usdc, weth, 500, usdcAmount, 0
);
uint256 minWeth = quotedWeth * 99 / 100; // 1% slippage

IERC20(usdc).approve(address(router), usdcAmount);
uint256 shares = router.zapDepositERC20(
    usdc,        // token in
    usdcAmount,  // amount
    500,         // Uniswap V3 pool fee tier (0.05%)
    minWeth      // amountOutMinimum
);`}
              </CodeBlock>
            </div>

            {/* Stateless guarantee */}
            <div className="border-l-2 border-vynx-border pl-4 py-2 space-y-2">
              <StatusBadge label="Stateless Guarantee" />
              <p className="text-sm text-vynx-muted">
                After every function, the Router internally asserts{" "}
                <span className="font-mono text-vynx-text">
                  WETH.balanceOf(address(this)) == 0
                </span>{" "}
                and{" "}
                <span className="font-mono text-vynx-text">
                  address(this).balance == 0
                </span>
                . A{" "}
                <span className="font-mono text-vynx-text">
                  ReentrancyGuard
                </span>{" "}
                modifier is applied to all external functions. No funds can be
                stranded or reentrancy-exploited.
              </p>
            </div>
          </section>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* 5. SECURITY MODEL                                            */}
          {/* ──────────────────────────────────────────────────────────── */}
          <section id="security" className="scroll-mt-32 space-y-8">
            <div className="space-y-2">
              <SectionTag label="Threat Model · Fail-safes · Trust Assumptions" />
              <H2>Security Model</H2>
            </div>

            {/* Trust assumptions */}
            <div className="space-y-3">
              <h3 className="text-vynx-text font-mono text-sm uppercase tracking-widest">
                Trust Assumptions
              </h3>
              <p className="text-sm">
                VynX inherits the security properties — and risks — of every
                integrated protocol. These dependencies are explicit, not
                abstracted away.
              </p>
              <div className="overflow-x-auto rounded border border-vynx-border">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-vynx-surface border-b border-vynx-border">
                      {["Protocol", "TVL / Scale", "Status", "Risk"].map(
                        (h) => (
                          <th
                            key={h}
                            className="p-3 font-mono text-[11px] uppercase tracking-wider text-vynx-muted"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-vynx-border text-xs font-mono">
                    {[
                      {
                        name: "Lido",
                        tvl: "> $30B",
                        status: "Battle-tested",
                        risk: "Slashing, stETH depeg",
                      },
                      {
                        name: "Aave v3",
                        tvl: "> $5B",
                        status: "Multi-audited",
                        risk: "Smart contract, utilization",
                      },
                      {
                        name: "Curve Finance",
                        tvl: "Large",
                        status: "Audited (Vyper ≥ 0.3.1)",
                        risk: "Jul 2023 gauge exploit (patched)",
                      },
                      {
                        name: "Uniswap V3",
                        tvl: "DEX standard",
                        status: "Heavily used",
                        risk: "MEV on swaps, IL",
                      },
                      {
                        name: "OpenZeppelin",
                        tvl: "—",
                        status: "Industry standard",
                        risk: "None expected",
                      },
                      {
                        name: "WETH",
                        tvl: "Canonical",
                        status: "No admin keys",
                        risk: "None",
                      },
                    ].map((row) => (
                      <tr
                        key={row.name}
                        className="hover:bg-vynx-surface/40 transition-colors"
                      >
                        <td className="p-3 text-vynx-text">{row.name}</td>
                        <td className="p-3 text-vynx-muted">{row.tvl}</td>
                        <td className="p-3 text-vynx-green">{row.status}</td>
                        <td className="p-3 text-vynx-muted">{row.risk}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Fail-safes */}
            <div className="space-y-3">
              <h3 className="text-vynx-text font-mono text-sm uppercase tracking-widest">
                Fail-safes & Circuit Breakers
              </h3>
              <div className="space-y-4">
                {/* Try-catch harvest */}
                <div className="p-5 border border-vynx-border rounded space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm text-vynx-text">
                      Try-Catch Harvest
                    </span>
                    <StatusBadge label="Implemented" />
                  </div>
                  <p className="text-sm text-vynx-muted">
                    <span className="font-mono text-vynx-text">
                      manager.harvest()
                    </span>{" "}
                    iterates all registered strategies inside individual{" "}
                    <span className="font-mono">try / catch</span> blocks. If
                    one strategy reverts (e.g. Curve gauge misconfigured, UniV3
                    pool dry), the exception is silently caught and the loop
                    continues to the next strategy. The failing strategy is
                    flagged but does not block the others.
                  </p>
                  <CodeBlock>
                    {`for (uint i = 0; i < strategies.length; i++) {
    try IStrategy(strategies[i]).harvest() {
        // success: rewards reinvested
    } catch {
        // strategy failed — continue to next
        emit HarvestFailed(strategies[i]);
    }
}`}
                  </CodeBlock>
                </div>

                {/* Emergency exit */}
                <div className="p-5 border border-vynx-border rounded space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm text-vynx-text">
                      Emergency Exit (3-Step Sequence)
                    </span>
                    <StatusBadge label="Implemented" />
                  </div>
                  <p className="text-sm text-vynx-muted">
                    Activated by the vault owner in response to an active
                    exploit or critical bug. All funds are drained from
                    strategies and returned to the vault's idle buffer.
                    Withdrawals are{" "}
                    <span className="text-vynx-text">never blocked</span> — even
                    when paused, users retain full access to their funds.
                  </p>
                  <CodeBlock>
                    {`// Step 1: Block new deposits and harvests
vault.pause();

// Step 2: Drain all strategies (try-catch per strategy)
manager.emergencyExit();

// Step 3: Reconcile idle buffer accounting
vault.syncIdleBuffer();

// After this sequence: all WETH is in idle_buffer.
// Users withdraw normally via vault.withdraw() or vault.redeem().`}
                  </CodeBlock>
                </div>

                {/* Circuit breakers */}
                <div className="p-5 border border-vynx-border rounded space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm text-vynx-text">
                      Circuit Breakers
                    </span>
                    <StatusBadge label="Implemented" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                    {[
                      { key: "max_tvl", val: "1,000 ETH" },
                      { key: "min_deposit", val: "0.01 ETH" },
                      {
                        key: "min_profit_for_harvest",
                        val: "0.08 / 0.12 ETH",
                      },
                      { key: "max_strategies", val: "10" },
                    ].map(({ key, val }) => (
                      <div key={key} className="flex justify-between gap-2">
                        <span className="text-vynx-muted">{key}</span>
                        <span className="text-vynx-gold">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Attack vectors */}
            <div className="space-y-3">
              <h3 className="text-vynx-text font-mono text-sm uppercase tracking-widest">
                Attack Vectors Analyzed
              </h3>
              <div className="overflow-x-auto rounded border border-vynx-border">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-vynx-surface border-b border-vynx-border">
                      <th className="p-3 font-mono text-[11px] uppercase tracking-wider text-vynx-muted">
                        Vector
                      </th>
                      <th className="p-3 font-mono text-[11px] uppercase tracking-wider text-vynx-muted">
                        Status
                      </th>
                      <th className="p-3 font-mono text-[11px] uppercase tracking-wider text-vynx-muted">
                        Mitigation
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-vynx-border text-xs font-mono">
                    {[
                      {
                        vec: "Reentrancy",
                        status: "Protected",
                        mit: "CEI pattern + SafeERC20 + ReentrancyGuard",
                      },
                      {
                        vec: "Rounding attacks",
                        status: "Protected",
                        mit: "0.01 ETH min deposit, ERC4626 rounding standard",
                      },
                      {
                        vec: "Flash loans",
                        status: "Not applicable",
                        mit: "No oracles, no on-chain voting, no arbitrage surface",
                      },
                      {
                        vec: "Front-running rebalances",
                        status: "Mitigated",
                        mit: "Public execution, no direct MEV profit vector",
                      },
                      {
                        vec: "Keeper spam",
                        status: "Mitigated",
                        mit: "min_profit_for_harvest gate enforced on-chain",
                      },
                      {
                        vec: "Uniswap slippage",
                        status: "Mitigated",
                        mit: "1% MAX_SLIPPAGE_BPS in strategies; user-set in Router",
                      },
                      {
                        vec: "Router exploit",
                        status: "Mitigated",
                        mit: "ReentrancyGuard + stateless + post-call balance assert",
                      },
                    ].map((row) => (
                      <tr
                        key={row.vec}
                        className="hover:bg-vynx-surface/40 transition-colors"
                      >
                        <td className="p-3 text-vynx-text">{row.vec}</td>
                        <td
                          className={`p-3 ${
                            row.status === "Not applicable"
                              ? "text-vynx-muted"
                              : "text-vynx-green"
                          }`}
                        >
                          {row.status}
                        </td>
                        <td className="p-3 text-vynx-muted">{row.mit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Centralization */}
            <div className="border-l-2 border-vynx-border pl-4 py-2 space-y-2">
              <WarningBadge label="Centralization Points" />
              <p className="text-sm text-vynx-muted">
                The vault owner (single EOA) can pause the vault, change
                performance fees, replace the treasury/founder address, and sync
                accounting. The StrategyManager owner can add new strategies
                (including malicious ones). The Router has{" "}
                <span className="text-vynx-text">zero privileges</span> over any
                contract. For production deployment, a multisig + timelock is
                strongly recommended. This project uses a single deployer EOA
                for simplicity.
              </p>
            </div>

            {/* Known limitations */}
            <div className="space-y-3">
              <h3 className="text-vynx-text font-mono text-md uppercase tracking-widest mb-8">
                Known Limitations
              </h3>
              <div className="space-y-8">
                <div className="space-y-3">
                  <p
                    className="font-mono text-sm uppercase text-vynx-text pb-2"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    Idle buffer earns no yield
                  </p>
                  <p className="text-sm text-vynx-muted">
                    Capital held in the vault's{" "}
                    <span className="font-mono">idle_buffer</span> does not earn
                    any yield between deposits. This is a deliberate trade-off:
                    simplicity and gas savings outweigh the opportunity cost for
                    short accumulation windows.
                  </p>
                </div>
                <div className="space-y-3">
                  <p
                    className="font-mono text-sm uppercase text-vynx-text pb-2"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    APYs partially hardcoded
                  </p>
                  <p className="text-sm text-vynx-muted">
                    LidoStrategy, CurveStrategy, and UniswapV3Strategy return
                    hardcoded APY approximations (400 bp, ~500 bp, ~700 bp
                    respectively). Only AaveStrategy reads its APY on-chain via{" "}
                    <span className="font-mono">getReserveData()</span>. This
                    means the allocation algorithm operates on stale data for
                    three of four strategies.
                  </p>
                </div>
                <div className="space-y-3">
                  <p
                    className="font-mono text-sm uppercase text-vynx-text pb-2"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    Manual rebalancing (keeper required)
                  </p>
                  <p className="text-sm text-vynx-muted">
                    Rebalancing is not automatic. An off-chain keeper must call{" "}
                    <span className="font-mono">manager.rebalance()</span> after
                    checking{" "}
                    <span className="font-mono">manager.shouldRebalance()</span>
                    . No on-chain automation (Chainlink Automation, Gelato,
                    etc.) is configured.
                  </p>
                </div>
                <div className="space-y-3">
                  <p
                    className="font-mono text-sm uppercase text-vynx-text pb-2"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    Single Uniswap V3 position
                  </p>
                  <p className="text-sm text-vynx-muted">
                    UniswapV3Strategy holds one active NFT position at a time.
                    If the price exits the ±10% range, the position must be
                    manually reinitiated by the protocol. No auto-rerange
                    mechanism exists.
                  </p>
                </div>
                <div className="space-y-3">
                  <p
                    className="font-mono text-sm uppercase text-vynx-text pb-2"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    Max 10 strategies
                  </p>
                  <p className="text-sm text-vynx-muted">
                    The StrategyManager limits registered strategies to 10 to
                    prevent gas DoS during harvest and allocation loops. This is
                    a hard-coded constant, not configurable post-deploy.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* 6. CONTRACT REGISTRY                                         */}
          {/* ──────────────────────────────────────────────────────────── */}
          <section id="contracts" className="scroll-mt-32 space-y-8">
            <div className="space-y-2">
              <SectionTag label="Ethereum Mainnet · Verified on Etherscan" />
              <H2>Contract Registry</H2>
            </div>

            <p className="text-sm">
              All contracts are deployed and source-verified on Etherscan.
              Source code is MIT-licensed and open source.
            </p>

            {/* Balanced tier */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h3 className="text-vynx-text font-mono text-sm uppercase tracking-widest">
                  Balanced Tier
                </h3>
              </div>
              <div className="overflow-x-auto rounded border border-vynx-border">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-vynx-surface border-b border-vynx-border">
                      <th className="p-3 font-mono text-[11px] uppercase tracking-wider text-vynx-muted">
                        Contract
                      </th>
                      <th className="p-3 font-mono text-[11px] uppercase tracking-wider text-vynx-muted">
                        Description
                      </th>
                      <th className="p-3 font-mono text-[11px] uppercase tracking-wider text-vynx-muted">
                        Mainnet Address
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-vynx-border text-xs">
                    {[
                      {
                        name: "Vault (vxWETH)",
                        desc: "ERC-4626 entry point. Accepts WETH, issues shares",
                        addr: "0x9D002dF2A5B632C0D8022a4738C1fa7465d88444",
                      },
                      {
                        name: "StrategyManager",
                        desc: "Allocates capital across yield strategies",
                        addr: "0xA0d462b84C2431463bDACDC2C5bc3172FC927B0B",
                      },
                      {
                        name: "LidoStrategy",
                        desc: "Stakes WETH into Lido wstETH",
                        addr: "0xf8d1E54A07A47BB03833493EAEB7FE7432B53FCB",
                      },
                      {
                        name: "AaveStrategy",
                        desc: "Lends wstETH on Aave v3",
                        addr: "0x8135Ed49ffFeEF4a1Bb5909c5bA96EEe9D4ed32A",
                      },
                      {
                        name: "CurveStrategy",
                        desc: "Provides liquidity to Curve stETH pool",
                        addr: "0xF0C57C9c1974a14602074D85cfB1Bc251B67Dc00",
                      },
                      {
                        name: "Router",
                        desc: "Stateless periphery. Accepts any token via Uniswap V3 swap",
                        addr: "0x3286c0cB7Bbc7DD4cC7C8752E3D65e275E1B1044",
                      },
                    ].map((row) => (
                      <tr
                        key={row.name}
                        className="hover:bg-vynx-surface/40 transition-colors"
                      >
                        <td className="p-3 font-mono text-vynx-text">
                          {row.name}
                        </td>
                        <td className="p-3 text-vynx-muted">{row.desc}</td>
                        <td className="p-3">
                          <Addr address={row.addr} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Aggressive tier */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h3 className="text-vynx-text font-mono text-sm uppercase tracking-widest">
                  Aggressive Tier
                </h3>
              </div>
              <div className="overflow-x-auto rounded border border-vynx-border">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-vynx-surface border-b border-vynx-border">
                      <th className="p-3 font-mono text-[11px] uppercase tracking-wider text-vynx-muted">
                        Contract
                      </th>
                      <th className="p-3 font-mono text-[11px] uppercase tracking-wider text-vynx-muted">
                        Description
                      </th>
                      <th className="p-3 font-mono text-[11px] uppercase tracking-wider text-vynx-muted">
                        Mainnet Address
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-vynx-border text-xs">
                    {[
                      {
                        name: "Vault (vxWETH)",
                        desc: "ERC-4626 entry point. Accepts WETH, issues shares",
                        addr: "0xA8cA9d84e35ac8F5af6F1D91fe4bE1C0BAf44296",
                      },
                      {
                        name: "StrategyManager",
                        desc: "Allocates capital across yield strategies",
                        addr: "0xcCa54463BD2aEDF1773E9c3f45c6a954Aa9D9706",
                      },
                      {
                        name: "CurveStrategy",
                        desc: "Provides liquidity to Curve stETH pool",
                        addr: "0x312510B911fA47D55c9f1a055B1987D51853A7DE",
                      },
                      {
                        name: "UniswapV3Strategy",
                        desc: "Manages concentrated WETH/WBTC liquidity position",
                        addr: "0x653D9C2dF3A32B872aEa4E3b4e7436577C5eEB62",
                      },
                      {
                        name: "Router",
                        desc: "Stateless periphery. Accepts any token via Uniswap V3 swap",
                        addr: "0xE898661760299f88e2B271a088987dacB8Fb3dE6",
                      },
                    ].map((row) => (
                      <tr
                        key={row.name}
                        className="hover:bg-vynx-surface/40 transition-colors"
                      >
                        <td className="p-3 font-mono text-vynx-text">
                          {row.name}
                        </td>
                        <td className="p-3 text-vynx-muted">{row.desc}</td>
                        <td className="p-3">
                          <Addr address={row.addr} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Key function signatures */}
            <div className="space-y-3">
              <h3 className="text-vynx-text font-mono text-sm uppercase tracking-widest">
                Core Interface
              </h3>
              <CodeBlock>
                {`// ERC-4626 Vault
vault.deposit(uint256 assets, address receiver) → uint256 shares
vault.withdraw(uint256 assets, address receiver, address owner) → uint256 shares
vault.redeem(uint256 shares, address receiver, address owner) → uint256 assets
vault.totalAssets() → uint256
vault.convertToShares(uint256 assets) → uint256
vault.convertToAssets(uint256 shares) → uint256

// StrategyManager
manager.rebalance() → void
manager.harvest() → void
manager.shouldRebalance() → bool
manager.totalAssets() → uint256
manager.allocate(uint256 amount) → void          // onlyVault
manager.withdrawTo(uint256 amount) → void        // onlyVault

// Router Periphery
router.zapDepositETH() payable → uint256 shares
router.zapDepositERC20(
    address token,
    uint256 amount,
    uint24  fee,
    uint256 min_weth_out
) → uint256 shares

router.zapWithdrawETH(uint256 shares) → uint256 eth_out
router.zapWithdrawERC20(
    uint256 shares,
    address token,
    uint24  fee,
    uint256 min_token_out
) → uint256 token_out`}
              </CodeBlock>
            </div>
          </section>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* 7. TEST SUITE                                                */}
          {/* ──────────────────────────────────────────────────────────── */}
          <section id="tests" className="scroll-mt-32 space-y-8 pb-24">
            <div className="space-y-2">
              <SectionTag label="Foundry · Ethereum Mainnet Fork · No Mocks" />
              <H2>Test Suite</H2>
            </div>

            {/* Header metrics */}
            <div className="grid grid-cols-3 gap-px bg-vynx-border border border-vynx-border rounded overflow-hidden">
              {[
                { label: "Total Tests", value: "160" },
                { label: "Test Strategy", value: "Mainnet Fork" },
                { label: "Mocks Used", value: "None" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="bg-vynx-bg px-5 py-4 flex flex-col gap-1"
                >
                  <span
                    className="font-mono text-vynx-gold"
                    style={{ fontSize: "1.25rem", lineHeight: 1 }}
                  >
                    {value}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-vynx-muted">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Test categories */}
            <div className="space-y-3">
              <h3 className="text-vynx-text font-mono text-sm uppercase tracking-widest">
                Test Categories
              </h3>
              <div className="overflow-x-auto rounded border border-vynx-border">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-vynx-surface border-b border-vynx-border">
                      {["Layer", "Count", "Files", "Notes"].map((h) => (
                        <th
                          key={h}
                          className="p-3 font-mono text-[11px] uppercase tracking-wider text-vynx-muted"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-vynx-border text-xs font-mono">
                    {[
                      {
                        layer: "Unit",
                        count: "145",
                        files:
                          "Vault, StrategyManager, Lido, Aave, Curve, UniV3, Router",
                        notes: "Per-function isolation",
                      },
                      {
                        layer: "Integration",
                        count: "10",
                        files: "FullFlow.t.sol",
                        notes: "End-to-end multi-user flows",
                      },
                      {
                        layer: "Fuzz",
                        count: "6 × 256 runs",
                        files: "Fuzz.t.sol",
                        notes: "Random valid inputs, stateless",
                      },
                      {
                        layer: "Invariant",
                        count: "4 × 32 runs × 15 depth",
                        files: "Invariants.t.sol",
                        notes: "Stateful, 480 total calls",
                      },
                    ].map((row) => (
                      <tr
                        key={row.layer}
                        className="hover:bg-vynx-surface/40 transition-colors"
                      >
                        <td className="p-3 text-vynx-text">{row.layer}</td>
                        <td className="p-3 text-vynx-gold">{row.count}</td>
                        <td className="p-3 text-vynx-muted">{row.files}</td>
                        <td className="p-3 text-vynx-muted">{row.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Coverage table */}
            <div className="space-y-3">
              <h3 className="text-vynx-text font-mono text-sm uppercase tracking-widest">
                Coverage Report
              </h3>
              <div className="overflow-x-auto rounded border border-vynx-border">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-vynx-surface border-b border-vynx-border">
                      {[
                        "Contract",
                        "Lines",
                        "Statements",
                        "Branches",
                        "Functions",
                      ].map((h) => (
                        <th
                          key={h}
                          className="p-3 font-mono text-[11px] uppercase tracking-wider text-vynx-muted"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-vynx-border text-xs font-mono">
                    {[
                      {
                        name: "Vault.sol",
                        lines: "92.51%",
                        stmts: "88.02%",
                        branches: "55.26%",
                        fns: "100%",
                      },
                      {
                        name: "StrategyManager.sol",
                        lines: "81.46%",
                        stmts: "81.27%",
                        branches: "52.08%",
                        fns: "100%",
                      },
                      {
                        name: "AaveStrategy.sol",
                        lines: "71.95%",
                        stmts: "69.89%",
                        branches: "41.67%",
                        fns: "91.67%",
                      },
                      {
                        name: "CurveStrategy.sol",
                        lines: "95.12%",
                        stmts: "97.09%",
                        branches: "71.43%",
                        fns: "100%",
                      },
                      {
                        name: "LidoStrategy.sol",
                        lines: "90.91%",
                        stmts: "91.30%",
                        branches: "66.67%",
                        fns: "90%",
                      },
                      {
                        name: "UniswapV3Strategy.sol",
                        lines: "75.21%",
                        stmts: "75.51%",
                        branches: "50%",
                        fns: "100%",
                      },
                      {
                        name: "Router.sol",
                        lines: "98.36%",
                        stmts: "80.95%",
                        branches: "28.57%",
                        fns: "100%",
                      },
                    ].map((row) => (
                      <tr
                        key={row.name}
                        className="hover:bg-vynx-surface/40 transition-colors"
                      >
                        <td className="p-3 text-vynx-text">{row.name}</td>
                        <td className="p-3 text-vynx-muted">{row.lines}</td>
                        <td className="p-3 text-vynx-muted">{row.stmts}</td>
                        <td className="p-3 text-vynx-muted">{row.branches}</td>
                        <td className="p-3 text-vynx-muted">{row.fns}</td>
                      </tr>
                    ))}
                    {/* Total row */}
                    <tr className="bg-vynx-surface/50 border-t border-vynx-border">
                      <td className="p-3 font-mono text-vynx-text font-medium">
                        Total
                      </td>
                      <td className="p-3 text-vynx-gold">85.42%</td>
                      <td className="p-3 text-vynx-gold">82.83%</td>
                      <td className="p-3 text-vynx-gold">50%</td>
                      <td className="p-3 text-vynx-gold">98.23%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Invariant properties */}
            <div className="space-y-3">
              <h3 className="text-vynx-text font-mono text-sm uppercase tracking-widest">
                Invariant Properties
              </h3>
              <p className="text-sm">
                Four invariants verified under 480 total operation calls (32
                runs × 15 depth). All passed with 0 failures.
              </p>
              <div className="space-y-2">
                {[
                  {
                    fn: "invariant_VaultIsSolvent()",
                    desc: "totalAssets ≥ 99% × totalSupply at all times. The 1% tolerance accounts for performance fee minting. Ensures the vault can always cover all withdrawal requests.",
                  },
                  {
                    fn: "invariant_AccountingIsConsistent()",
                    desc: "idle_buffer + manager.totalAssets() == vault.totalAssets(). All WETH in the system is accounted for — nothing is untracked or orphaned.",
                  },
                  {
                    fn: "invariant_SupplyIsCoherent()",
                    desc: "Sum of all known user share balances ≤ totalSupply. No user can hold more shares than exist — prevents phantom balance exploits.",
                  },
                  {
                    fn: "invariant_RouterAlwaysStateless()",
                    desc: "WETH.balanceOf(router) == 0 and router.balance == 0 after every transaction. The Router never retains funds between calls.",
                  },
                ].map(({ fn, desc }) => (
                  <div
                    key={fn}
                    className="p-4 border border-vynx-border rounded bg-vynx-surface/10 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-mono text-xs text-vynx-gold break-all">
                        {fn}
                      </span>
                      <StatusBadge label="Passed" />
                    </div>
                    <p className="text-xs text-vynx-muted leading-relaxed">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Run commands */}
            <div className="space-y-3">
              <h3 className="text-vynx-text font-mono text-sm uppercase tracking-widest">
                Running the Suite
              </h3>
              <CodeBlock>
                {`# Set your Alchemy/Infura RPC
export MAINNET_RPC_URL="https://eth-mainnet.g.alchemy.com/v2/<API_KEY>"

# Unit + integration + fuzz tests (149 tests)
forge test --no-match-path "test/invariant/*" -vv

# Invariant tests via Anvil proxy (rate-limiting controlled)
./script/run_invariants_offline.sh

# Coverage report (excludes invariant tests)
forge coverage --no-match-path "test/invariant/*" --ir-minimum

# Generate and serve NatSpec docs
forge doc --serve --port 4000`}
              </CodeBlock>
            </div>

            {/* Acknowledgements */}
            <div className="space-y-4 pt-4">
              <h3 className="text-vynx-text font-mono text-sm uppercase tracking-widest">
                Acknowledgements
              </h3>
              <p className="text-sm text-vynx-muted">
                This project would not have been possible without three key
                mentors.
              </p>
              <div className="space-y-8">
                <div className="space-y-3">
                  <p
                    className="font-mono text-sm uppercase text-vynx-text pb-2"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    Patrick Collins
                  </p>
                  <p className="text-sm text-vynx-muted">
                    His Solidity and Foundry course on Cyfrin Updraft was the
                    technical foundation of this project. His rigorous
                    approach — tests first, invariants, fuzz testing — directly
                    shapes the architecture of VynX's test suite. Thank you for
                    making smart contract knowledge accessible and honest.
                  </p>
                </div>
                <div className="space-y-3">
                  <p
                    className="font-mono text-sm uppercase text-vynx-text pb-2"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    Claude (Anthropic)
                  </p>
                  <p className="text-sm text-vynx-muted">
                    Development assistant and architectural sounding board
                    throughout the entire project lifecycle. From contract
                    structure to this documentation, Claude acted as a permanent
                    technical peer — challenging assumptions, proposing
                    alternatives, and holding the quality bar.
                  </p>
                </div>
                <div className="space-y-3">
                  <p
                    className="font-mono text-sm uppercase text-vynx-text pb-2"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    Steve Jobs
                  </p>
                  <p className="text-sm text-vynx-muted">
                    For his lifelong commitment to minimalist design and the
                    belief that simplicity is the ultimate sophistication.
                    Indirectly, he taught me that{" "}
                    <span className="font-mono text-vynx-text">
                      Simplicity³
                    </span>{" "}
                    — not just simple, but ruthlessly, relentlessly,
                    obsessively simple — should be the standard every product
                    is held to.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
