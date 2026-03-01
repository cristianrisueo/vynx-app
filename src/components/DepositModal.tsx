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
  useBalance,
} from "wagmi"
import { useQueryClient } from "@tanstack/react-query"
import { parseUnits, formatUnits } from "viem"
import type { Address } from "viem"
import { SUPPORTED_TOKENS, QUOTER_V2_ADDRESS } from "@/config/addresses"
import type { TokenConfig } from "@/config/addresses"
import { vaultAbi } from "@/abis/vault.abi"
import { routerAbi } from "@/abis/router.abi"
import { erc20Abi } from "@/abis/erc20.abi"
import { quoterAbi } from "@/abis/quoter.abi"

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
interface DepositModalProps {
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
export default function DepositModal({
  isOpen,
  onClose,
  vaultAddress,
  routerAddress,
  vaultName,
}: DepositModalProps) {
  const { address: userAddress, isConnected } = useAccount()
  const { connect } = useConnect()
  const connectors = useConnectors()
  const publicClient = usePublicClient()
  const queryClient = useQueryClient()

  // Estado del modal
  const [selectedToken, setSelectedToken] = useState<TokenConfig>(SUPPORTED_TOKENS[0])
  const [rawAmount, setRawAmount] = useState("")
  const [slippage, setSlippage] = useState<0.1 | 0.5 | 1.0>(0.5)
  const [customSlippage, setCustomSlippage] = useState("")
  const [tokenDropdownOpen, setTokenDropdownOpen] = useState(false)
  const [quotedWeth, setQuotedWeth] = useState<bigint | null>(null)
  const [quoterLoading, setQuoterLoading] = useState(false)
  const [quoterError, setQuoterError] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const debouncedAmount = useDebounce(rawAmount, 500)

  // Indica si el token requiere swap (no es ETH ni WETH)
  const needsSwap = selectedToken.poolFee !== null

  // Spender: vault para WETH directo, router para ERC20
  const spender =
    selectedToken.symbol === "WETH" ? vaultAddress : routerAddress

  // ── Lectura: balance del token seleccionado ──────────────────────────────
  const { data: ethBalanceData } = useBalance({
    address: userAddress,
    query: { enabled: !!userAddress && selectedToken.symbol === "ETH" },
  })

  const { data: erc20Balance } = useReadContract({
    address: selectedToken.address ?? "0x",
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [userAddress ?? "0x0000000000000000000000000000000000000000"],
    query: {
      enabled: !!userAddress && selectedToken.symbol !== "ETH",
    },
  })

  // Balance del token formateado
  const userBalance =
    selectedToken.symbol === "ETH"
      ? ethBalanceData
        ? formatUnits(ethBalanceData.value, 18)
        : "0"
      : erc20Balance !== undefined
        ? formatUnits(erc20Balance as bigint, selectedToken.decimals)
        : "0"

  // ── Lectura: allowance actual ────────────────────────────────────────────
  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    address: selectedToken.address ?? "0x",
    abi: erc20Abi,
    functionName: "allowance",
    args: [
      userAddress ?? "0x0000000000000000000000000000000000000000",
      spender,
    ],
    query: {
      enabled: !!userAddress && selectedToken.symbol !== "ETH",
    },
  })

  const allowance = (allowanceData as bigint | undefined) ?? 0n

  // Amount parseado a bigint según decimales del token
  const parsedAmount =
    rawAmount && !isNaN(parseFloat(rawAmount)) && parseFloat(rawAmount) > 0
      ? parseUnits(rawAmount, selectedToken.decimals)
      : 0n

  const needsApproval =
    selectedToken.symbol !== "ETH" && parsedAmount > 0n && allowance < parsedAmount

  // ── Quoter de Uniswap V3 (solo para ERC20) ───────────────────────────────
  useEffect(() => {
    if (!needsSwap || !debouncedAmount || parseFloat(debouncedAmount) <= 0) {
      setQuotedWeth(null)
      setQuoterError(false)
      return
    }
    if (!publicClient) return

    const amountIn = parseUnits(debouncedAmount, selectedToken.decimals)
    setQuoterLoading(true)
    setQuoterError(false)

    // Usar simulateContract porque quoteExactInputSingle es nonpayable, no view
    publicClient
      .simulateContract({
        address: QUOTER_V2_ADDRESS as Address,
        abi: quoterAbi,
        functionName: "quoteExactInputSingle",
        args: [
          {
            tokenIn: selectedToken.address as Address,
            tokenOut: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" as Address,
            amountIn,
            fee: selectedToken.poolFee as number,
            sqrtPriceLimitX96: 0n,
          },
        ],
      })
      .then(({ result }) => {
        // amountOut es el primer elemento del tuple de retorno
        setQuotedWeth((result as readonly [bigint, bigint, number, bigint])[0])
        setQuoterLoading(false)
      })
      .catch(() => {
        setQuotedWeth(null)
        setQuoterLoading(false)
        setQuoterError(true)
      })
  }, [debouncedAmount, selectedToken, needsSwap, publicClient])

  // Slippage efectivo (custom si está definido, sino el seleccionado)
  const effectiveSlippage = customSlippage
    ? parseFloat(customSlippage)
    : slippage

  // Min WETH out con slippage aplicado
  const minWethOut =
    quotedWeth && effectiveSlippage > 0
      ? (quotedWeth * BigInt(Math.round((1 - effectiveSlippage / 100) * 10_000))) /
        10_000n
      : 0n

  // Shares estimadas que recibirá el usuario (para el resumen)
  const estimatedShares =
    selectedToken.symbol === "ETH" || selectedToken.symbol === "WETH"
      ? parsedAmount
      : quotedWeth ?? 0n

  // ── Escritura: write + confirmación ─────────────────────────────────────
  const {
    writeContract,
    data: txHash,
    isPending,
    reset: resetWrite,
  } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash: txHash })

  // Reset del estado al cambiar de token o cerrar
  useEffect(() => {
    setQuotedWeth(null)
    setQuoterError(false)
    setErrorMsg("")
  }, [selectedToken])

  // Limpiar estado al cerrar
  useEffect(() => {
    if (!isOpen) {
      setRawAmount("")
      setQuotedWeth(null)
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

  // Invalidar cache e invalidar queries tras éxito + cerrar modal
  useEffect(() => {
    if (!isSuccess) return

    // Invalidar lecturas del vault afectado
    queryClient.invalidateQueries({
      predicate: (q) =>
        JSON.stringify(q.queryKey).toLowerCase().includes(vaultAddress.toLowerCase()),
    })
    queryClient.invalidateQueries({ queryKey: ["harvests"] })
    refetchAllowance()

    // Cerrar modal tras 2 segundos
    const timer = setTimeout(() => onClose(), 2_000)
    return () => clearTimeout(timer)
  }, [isSuccess, queryClient, vaultAddress, onClose, refetchAllowance])

  // ── Acción principal ─────────────────────────────────────────────────────
  const handleAction = useCallback(() => {
    if (!isConnected) {
      const injected = connectors[0]
      if (injected) connect({ connector: injected })
      return
    }
    if (!userAddress || parsedAmount === 0n) return

    setErrorMsg("")

    try {
      if (selectedToken.symbol === "ETH") {
        // Caso 1: ETH nativo → zapDepositETH (payable)
        writeContract({
          address: routerAddress,
          abi: routerAbi,
          functionName: "zapDepositETH",
          value: parsedAmount,
        })
        return
      }

      if (needsApproval) {
        // Approve al spender correspondiente
        writeContract({
          address: selectedToken.address as Address,
          abi: erc20Abi,
          functionName: "approve",
          args: [spender, parsedAmount],
        })
        return
      }

      if (selectedToken.symbol === "WETH") {
        // Caso 2: WETH directo → vault.deposit
        writeContract({
          address: vaultAddress,
          abi: vaultAbi,
          functionName: "deposit",
          args: [parsedAmount, userAddress],
        })
        return
      }

      // Caso 3: ERC20 → zapDepositERC20 con slippage
      writeContract({
        address: routerAddress,
        abi: routerAbi,
        functionName: "zapDepositERC20",
        args: [
          selectedToken.address as Address,
          parsedAmount,
          selectedToken.poolFee as number,
          minWethOut,
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
    parsedAmount,
    selectedToken,
    needsApproval,
    spender,
    vaultAddress,
    routerAddress,
    minWethOut,
    writeContract,
  ])

  // Cerrar al hacer click en el overlay
  const handleOverlayClick = useCallback(() => onClose(), [onClose])

  // ── Label del botón según estado ─────────────────────────────────────────
  function getButtonLabel(): string {
    if (!isConnected) return "CONNECT WALLET"
    if (isSuccess) return "DEPOSIT CONFIRMED ✓"
    if (isPending) return "CONFIRMING..."
    if (isConfirming) return "DEPOSITING..."
    if (needsApproval) return `APPROVE ${selectedToken.symbol}`
    return "DEPOSIT →"
  }

  function getButtonColor(): string {
    if (isSuccess) return "var(--green)"
    if (!isConnected || isPending || isConfirming) return "var(--muted)"
    return "var(--gold)"
  }

  function getButtonBorder(): string {
    if (isSuccess) return "1px solid var(--green)"
    if (!isConnected || isPending || isConfirming)
      return "1px solid var(--border)"
    return "1px solid var(--gold)"
  }

  if (!isOpen) return null

  return createPortal(
    // Overlay exterior
    <div
      onClick={handleOverlayClick}
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
              DEPOSIT
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

        {/* ── Selector de token ── */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Token</label>
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
              <span>{selectedToken.symbol} — {selectedToken.name}</span>
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
                  const isSelected = token.symbol === selectedToken.symbol
                  return (
                    <button
                      key={token.symbol}
                      onClick={() => {
                        setSelectedToken(token as TokenConfig)
                        setTokenDropdownOpen(false)
                        setRawAmount("")
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
                      {/* Indicador dorado para token seleccionado */}
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

        {/* ── Input de cantidad ── */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Amount</label>
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
              value={rawAmount}
              onChange={(e) => setRawAmount(e.target.value)}
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
              onClick={() => setRawAmount(parseFloat(userBalance).toString())}
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
            Balance: {parseFloat(userBalance).toFixed(4)} {selectedToken.symbol}
          </div>
        </div>

        {/* ── Output estimado (solo para ERC20 con poolFee) ── */}
        {needsSwap && (
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Estimated Output</label>
            <div style={{ ...monoStyle, fontSize: 14, color: "var(--text)" }}>
              {quoterLoading ? (
                <span style={{ color: "var(--muted)" }}>Calculating...</span>
              ) : quoterError ? (
                <span style={{ color: "var(--muted)" }}>Unable to estimate</span>
              ) : quotedWeth ? (
                `~${parseFloat(formatUnits(quotedWeth, 18)).toFixed(4)} WETH`
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
              You deposit
            </span>
            <span style={{ ...monoStyle, fontSize: 11, color: "var(--text)" }}>
              {rawAmount || "0"} {selectedToken.symbol}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: needsSwap ? 8 : 0,
            }}
          >
            <span style={{ ...monoStyle, fontSize: 11, color: "var(--muted)" }}>
              You receive
            </span>
            <span style={{ ...monoStyle, fontSize: 11, color: "var(--green)" }}>
              ~
              {estimatedShares > 0n
                ? parseFloat(formatUnits(estimatedShares, 18)).toFixed(4)
                : "0.0000"}{" "}
              vxWETH
            </span>
          </div>
          {needsSwap && minWethOut > 0n && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ ...monoStyle, fontSize: 11, color: "var(--muted)" }}>
                Min. received
              </span>
              <span style={{ ...monoStyle, fontSize: 11, color: "var(--muted)" }}>
                {parseFloat(formatUnits(minWethOut, 18)).toFixed(4)} WETH
              </span>
            </div>
          )}
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
