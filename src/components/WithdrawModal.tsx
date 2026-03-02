import { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import {
  useAccount,
  useConnect,
  useConnectors,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from "wagmi"
import { useQueryClient } from "@tanstack/react-query"
import { parseUnits, formatUnits } from "viem"
import type { Address } from "viem"
import { SUPPORTED_TOKENS, QUOTER_V2_ADDRESS, ADDRESSES } from "@/config/addresses"
import type { TokenConfig } from "@/config/addresses"
import { vaultAbi } from "@/abis/vault.abi"
import { routerAbi } from "@/abis/router.abi"
import { erc20Abi } from "@/abis/erc20.abi"
import { quoterAbi } from "@/abis/quoter.abi"
import { useVault } from "@/hooks/useVault"

// ── Utilidad: debounce genérico ──────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

// ── Props ────────────────────────────────────────────────────────────────────
interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
  vaultAddress: Address
  routerAddress: Address
  vaultName: string
}

// ── Estilos compartidos ──────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace",
  fontSize: 10,
  letterSpacing: 2,
  textTransform: "uppercase",
  color: "var(--muted)",
  marginBottom: 8,
  display: "block",
}

const monoStyle: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace",
}

const separatorStyle: React.CSSProperties = {
  borderTop: "1px solid var(--border)",
  margin: "20px 0",
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function WithdrawModal({
  isOpen,
  onClose,
  vaultAddress,
  routerAddress,
  vaultName,
}: WithdrawModalProps) {
  const { address: userAddress, isConnected } = useAccount()
  const { connect } = useConnect()
  const connectors = useConnectors()
  const publicClient = usePublicClient()
  const queryClient = useQueryClient()

  // Datos del vault para saber la posición del usuario
  const { userPosition } = useVault(vaultAddress)

  // Estado del modal
  const [outputToken, setOutputToken] = useState<TokenConfig>(SUPPORTED_TOKENS[0])
  const [rawWethAmount, setRawWethAmount] = useState("")
  const [slippage, setSlippage] = useState<0.1 | 0.5 | 1.0>(0.5)
  const [customSlippage, setCustomSlippage] = useState("")
  const [tokenDropdownOpen, setTokenDropdownOpen] = useState(false)
  const [quotedToken, setQuotedToken] = useState<bigint | null>(null)
  const [quoterLoading, setQuoterLoading] = useState(false)
  const [quoterError, setQuoterError] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const debouncedAmount = useDebounce(rawWethAmount, 500)

  // Requiere swap si el token de salida no es ETH ni WETH
  const needsSwap = outputToken.poolFee !== null

  // Amount en WETH parseado
  const parsedWethAmount =
    rawWethAmount && !isNaN(parseFloat(rawWethAmount)) && parseFloat(rawWethAmount) > 0
      ? parseUnits(rawWethAmount, 18)
      : 0n

  // ── Calcular shares necesarias para el WETH solicitado ──────────────────
  const { data: sharesNeededData } = useReadContract({
    address: vaultAddress,
    abi: vaultAbi,
    functionName: "convertToShares",
    args: [parsedWethAmount],
    query: {
      enabled: parsedWethAmount > 0n,
      staleTime: 5_000,
    },
  })

  const sharesNeeded = (sharesNeededData as bigint | undefined) ?? 0n

  // ── Allowance de shares al router (para ETH y ERC20) ────────────────────
  const { data: sharesAllowanceData, refetch: refetchSharesAllowance } =
    useReadContract({
      address: vaultAddress,
      abi: erc20Abi,
      functionName: "allowance",
      args: [
        userAddress ?? "0x0000000000000000000000000000000000000000",
        routerAddress,
      ],
      query: {
        enabled: !!userAddress && outputToken.symbol !== "WETH",
      },
    })

  const sharesAllowance = (sharesAllowanceData as bigint | undefined) ?? 0n

  const needsShareApproval =
    outputToken.symbol !== "WETH" &&
    sharesNeeded > 0n &&
    sharesAllowance < sharesNeeded

  // ── Quoter de Uniswap V3 (WETH → outputToken, solo para ERC20) ──────────
  useEffect(() => {
    if (!needsSwap || !debouncedAmount || parseFloat(debouncedAmount) <= 0) {
      setQuotedToken(null)
      setQuoterError(false)
      return
    }
    if (!publicClient) return

    const amountIn = parseUnits(debouncedAmount, 18) // WETH tiene 18 decimals
    setQuoterLoading(true)
    setQuoterError(false)

    // simulateContract porque quoteExactInputSingle es nonpayable, no view
    publicClient
      .simulateContract({
        address: QUOTER_V2_ADDRESS as Address,
        abi: quoterAbi,
        functionName: "quoteExactInputSingle",
        args: [
          {
            tokenIn: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" as Address,
            tokenOut: outputToken.address as Address,
            amountIn,
            fee: outputToken.poolFee as number,
            sqrtPriceLimitX96: 0n,
          },
        ],
      })
      .then(({ result }) => {
        setQuotedToken((result as readonly [bigint, bigint, number, bigint])[0])
        setQuoterLoading(false)
      })
      .catch(() => {
        setQuotedToken(null)
        setQuoterLoading(false)
        setQuoterError(true)
      })
  }, [debouncedAmount, outputToken, needsSwap, publicClient])

  // Slippage efectivo
  const effectiveSlippage = customSlippage
    ? parseFloat(customSlippage)
    : slippage

  // Min token out con slippage aplicado
  const minTokenOut =
    quotedToken && effectiveSlippage > 0
      ? (quotedToken *
          BigInt(Math.round((1 - effectiveSlippage / 100) * 10_000))) /
        10_000n
      : 0n

  // ── Escritura: write + confirmación ─────────────────────────────────────
  const {
    writeContract,
    data: txHash,
    isPending,
    reset: resetWrite,
  } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash: txHash })

  // Reset al cambiar token de salida
  useEffect(() => {
    setQuotedToken(null)
    setQuoterError(false)
    setErrorMsg("")
  }, [outputToken])

  // Limpiar estado al cerrar
  useEffect(() => {
    if (!isOpen) {
      setRawWethAmount("")
      setQuotedToken(null)
      setErrorMsg("")
      resetWrite()
    }
  }, [isOpen, resetWrite])

  // Bloquear scroll del body mientras el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = ""
      }
    }
  }, [isOpen])

  // Cerrar con tecla Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [isOpen, onClose])

  // Invalidar cache tras éxito + cerrar modal
  useEffect(() => {
    if (!isSuccess) return

    queryClient.invalidateQueries({
      predicate: (q) =>
        JSON.stringify(q.queryKey).toLowerCase().includes(vaultAddress.toLowerCase()),
    })
    queryClient.invalidateQueries({ queryKey: ["harvests"] })
    // Invalidar TVL de ambos vaults (useReadContracts en useVault)
    queryClient.invalidateQueries({
      predicate: (q) => {
        const key = JSON.stringify(q.queryKey).toLowerCase()
        return (
          key.includes(ADDRESSES.balanced.vault.toLowerCase()) ||
          key.includes(ADDRESSES.aggressive.vault.toLowerCase())
        )
      },
    })
    refetchSharesAllowance()

    const timer = setTimeout(() => onClose(), 2_000)
    return () => clearTimeout(timer)
  }, [isSuccess, queryClient, vaultAddress, onClose, refetchSharesAllowance])

  // ── Acción principal ─────────────────────────────────────────────────────
  const handleAction = useCallback(() => {
    if (!isConnected) {
      const injected = connectors[0]
      if (injected) connect({ connector: injected })
      return
    }
    if (!userAddress || sharesNeeded === 0n) return

    setErrorMsg("")

    try {
      if (outputToken.symbol === "WETH") {
        // Caso 1: WETH directo → vault.redeem (sin router)
        writeContract({
          address: vaultAddress,
          abi: vaultAbi,
          functionName: "redeem",
          args: [sharesNeeded, userAddress, userAddress],
        })
        return
      }

      if (needsShareApproval) {
        // Approve de shares al router
        writeContract({
          address: vaultAddress,
          abi: erc20Abi,
          functionName: "approve",
          args: [routerAddress, sharesNeeded],
        })
        return
      }

      if (outputToken.symbol === "ETH") {
        // Caso 2: ETH nativo → zapWithdrawETH
        writeContract({
          address: routerAddress,
          abi: routerAbi,
          functionName: "zapWithdrawETH",
          args: [sharesNeeded],
        })
        return
      }

      // Caso 3: ERC20 → zapWithdrawERC20 con slippage
      writeContract({
        address: routerAddress,
        abi: routerAbi,
        functionName: "zapWithdrawERC20",
        args: [
          sharesNeeded,
          outputToken.address as Address,
          outputToken.poolFee as number,
          minTokenOut,
        ],
      })
    } catch {
      setErrorMsg("Transaction failed. Please try again.")
    }
  }, [
    isConnected,
    connectors,
    connect,
    userAddress,
    sharesNeeded,
    outputToken,
    needsShareApproval,
    vaultAddress,
    routerAddress,
    minTokenOut,
    writeContract,
  ])

  // ── Label del botón ──────────────────────────────────────────────────────
  function getButtonLabel(): string {
    if (!isConnected) return "CONNECT WALLET"
    if (isSuccess) return "WITHDRAW CONFIRMED ✓"
    if (isPending) return "CONFIRMING..."
    if (isConfirming) return "WITHDRAWING..."
    if (sharesNeeded === 0n && parsedWethAmount === 0n) return "ENTER AMOUNT"
    if (needsShareApproval) return "APPROVE VAULT SHARES"
    return "WITHDRAW →"
  }

  function getButtonColor(): string {
    if (isSuccess) return "var(--green)"
    if (!isConnected || isPending || isConfirming || sharesNeeded === 0n)
      return "var(--muted)"
    return "var(--gold)"
  }

  function getButtonBorder(): string {
    if (isSuccess) return "1px solid var(--green)"
    if (!isConnected || isPending || isConfirming || sharesNeeded === 0n)
      return "1px solid var(--border)"
    return "1px solid var(--gold)"
  }

  if (!isOpen) return null

  return createPortal(
    // Overlay exterior
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(8,8,10,0.85)",
        backdropFilter: "blur(4px)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Panel del modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          width: 480,
          maxWidth: "95vw",
          padding: 32,
          position: "relative",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 4,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 28,
                letterSpacing: 3,
                color: "var(--text)",
                lineHeight: 1,
              }}
            >
              WITHDRAW
            </div>
            <div
              style={{
                ...monoStyle,
                fontSize: 10,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "var(--gold)",
                marginTop: 4,
              }}
            >
              {vaultName.toUpperCase()} VAULT
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              ...monoStyle,
              fontSize: 20,
              color: "var(--muted)",
              background: "none",
              border: "none",
              cursor: "pointer",
              lineHeight: 1,
              padding: 0,
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--muted)")
            }
          >
            ×
          </button>
        </div>

        <div style={separatorStyle} />

        {/* ── Selector de token de salida ── */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Receive In</label>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setTokenDropdownOpen((v) => !v)}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                cursor: "pointer",
                ...monoStyle,
                fontSize: 13,
                transition: "border-color 0.15s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "var(--gold)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "var(--border)")
              }
            >
              <span>{outputToken.symbol} — {outputToken.name}</span>
              <span style={{ color: "var(--muted)" }}>▾</span>
            </button>

            {tokenDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 2px)",
                  left: 0,
                  right: 0,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  zIndex: 10,
                }}
              >
                {SUPPORTED_TOKENS.map((token) => {
                  const isSelected = token.symbol === outputToken.symbol
                  return (
                    <button
                      key={token.symbol}
                      onClick={() => {
                        setOutputToken(token as TokenConfig)
                        setTokenDropdownOpen(false)
                      }}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 16px",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        transition: "background 0.15s ease",
                        textAlign: "left",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "var(--bg)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <span
                        style={{
                          width: 3,
                          height: 16,
                          background: isSelected
                            ? "var(--gold)"
                            : "transparent",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          ...monoStyle,
                          fontSize: 12,
                          color: "var(--text)",
                        }}
                      >
                        {token.symbol}
                      </span>
                      <span
                        style={{
                          ...monoStyle,
                          fontSize: 11,
                          color: "var(--muted)",
                        }}
                      >
                        {token.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Input de cantidad en WETH ── */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Amount (WETH)</label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              padding: "0 12px",
            }}
          >
            <input
              type="number"
              min="0"
              step="any"
              placeholder="0.00"
              value={rawWethAmount}
              onChange={(e) => setRawWethAmount(e.target.value)}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                padding: "14px 0",
                ...monoStyle,
                fontSize: 20,
                color: "var(--text)",
              }}
            />
            <button
              onClick={() =>
                setRawWethAmount(parseFloat(userPosition).toString())
              }
              style={{
                ...monoStyle,
                fontSize: 10,
                letterSpacing: 1,
                color: "var(--gold)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 8px",
                transition: "opacity 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              MAX
            </button>
          </div>
          <div
            style={{
              ...monoStyle,
              fontSize: 11,
              color: "var(--muted)",
              marginTop: 6,
            }}
          >
            Your position: {parseFloat(userPosition).toFixed(4)} WETH
          </div>
        </div>

        {/* ── Output estimado (solo para ERC20) ── */}
        {needsSwap && (
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Estimated Output</label>
            <div style={{ ...monoStyle, fontSize: 14, color: "var(--text)" }}>
              {quoterLoading ? (
                <span style={{ color: "var(--muted)" }}>Calculating...</span>
              ) : quoterError ? (
                <span style={{ color: "var(--muted)" }}>Unable to estimate</span>
              ) : quotedToken ? (
                `~${parseFloat(formatUnits(quotedToken, outputToken.decimals)).toFixed(4)} ${outputToken.symbol}`
              ) : (
                <span style={{ color: "var(--muted)" }}>—</span>
              )}
            </div>
          </div>
        )}

        {/* ── Slippage (solo para ERC20) ── */}
        {needsSwap && (
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Slippage</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {([0.1, 0.5, 1.0] as const).map((s) => {
                const isActive = !customSlippage && slippage === s
                return (
                  <button
                    key={s}
                    onClick={() => {
                      setSlippage(s)
                      setCustomSlippage("")
                    }}
                    style={{
                      ...monoStyle,
                      fontSize: 11,
                      letterSpacing: 1,
                      padding: "8px 12px",
                      background: "transparent",
                      border: isActive
                        ? "1px solid var(--gold)"
                        : "1px solid var(--border)",
                      color: isActive ? "var(--gold)" : "var(--muted)",
                      cursor: "pointer",
                      transition: "border-color 0.15s ease, color 0.15s ease",
                    }}
                  >
                    {s}%
                  </button>
                )
              })}
              <input
                type="number"
                min="0"
                max="50"
                step="0.1"
                placeholder="Custom %"
                value={customSlippage}
                onChange={(e) => setCustomSlippage(e.target.value)}
                style={{
                  flex: 1,
                  ...monoStyle,
                  fontSize: 11,
                  padding: "8px 10px",
                  background: "var(--bg)",
                  border: customSlippage
                    ? "1px solid var(--gold)"
                    : "1px solid var(--border)",
                  color: customSlippage ? "var(--gold)" : "var(--muted)",
                  outline: "none",
                }}
              />
            </div>
          </div>
        )}

        <div style={separatorStyle} />

        {/* ── Resumen de la operación ── */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span style={{ ...monoStyle, fontSize: 11, color: "var(--muted)" }}>
              You withdraw
            </span>
            <span style={{ ...monoStyle, fontSize: 11, color: "var(--text)" }}>
              {rawWethAmount || "0"} WETH
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span style={{ ...monoStyle, fontSize: 11, color: "var(--muted)" }}>
              You receive
            </span>
            <span style={{ ...monoStyle, fontSize: 11, color: "var(--text)" }}>
              {needsSwap && quotedToken
                ? `~${parseFloat(formatUnits(quotedToken, outputToken.decimals)).toFixed(4)} ${outputToken.symbol}`
                : `~${rawWethAmount || "0"} ${outputToken.symbol}`}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ ...monoStyle, fontSize: 11, color: "var(--muted)" }}>
              Shares burned
            </span>
            <span style={{ ...monoStyle, fontSize: 11, color: "var(--muted)" }}>
              ~
              {sharesNeeded > 0n
                ? parseFloat(formatUnits(sharesNeeded, 18)).toFixed(4)
                : "0.0000"}{" "}
              vxWETH
            </span>
          </div>
        </div>

        {/* ── Botón principal ── */}
        <button
          onClick={handleAction}
          disabled={isPending || isConfirming || isSuccess}
          style={{
            width: "100%",
            ...monoStyle,
            fontSize: 12,
            letterSpacing: 2,
            textTransform: "uppercase",
            padding: "14px 32px",
            background: "transparent",
            border: getButtonBorder(),
            color: getButtonColor(),
            cursor:
              isPending || isConfirming || isSuccess ? "not-allowed" : "pointer",
            transition: "opacity 0.15s ease",
            opacity: isPending || isConfirming ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isPending && !isConfirming && !isSuccess)
              e.currentTarget.style.opacity = "0.8"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1"
          }}
        >
          {getButtonLabel()}
        </button>

        {/* Mensaje de error */}
        {errorMsg && (
          <div
            style={{
              ...monoStyle,
              fontSize: 11,
              color: "var(--muted)",
              marginTop: 8,
              textAlign: "center",
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* ── Nota al pie ── */}
        <div
          style={{
            marginTop: 20,
            textAlign: "center",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 300,
            fontSize: 11,
            color: "var(--muted)",
          }}
        >
          Advanced users can interact directly with the{" "}
          <a
            href={`https://etherscan.io/address/${routerAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--muted)",
              textDecoration: "none",
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--muted)")
            }
          >
            contract
          </a>
        </div>
      </div>
    </div>,
    document.body,
  )
}
