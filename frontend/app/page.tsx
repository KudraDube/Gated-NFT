"use client";
import { useState } from "react";
import { BrowserProvider } from "ethers";

const SERVER = "http://localhost:3001";

type Status = "idle" | "connecting" | "checking" | "granted" | "denied" | "error";

export default function Home() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const shortAddr = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

  async function connectWallet() {
    if (!window.ethereum) {
      setStatus("error");
      setMessage("MetaMask not found. Please install it.");
      return;
    }
    setStatus("connecting");
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      setWallet(signer.address);
      setStatus("idle");
    } catch {
      setStatus("error");
      setMessage("Wallet connection rejected.");
    }
  }

  async function checkAccess() {
    if (!wallet) return;
    setStatus("checking");
    setMessage("");
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // 1. Get message from server
      const msgRes = await fetch(`${SERVER}/api/message`);
      const { message: msg } = await msgRes.json();

      // 2. Sign with ethers signer
      const signature = await signer.signMessage(msg);

      // 3. Verify on server
      const verRes = await fetch(`${SERVER}/api/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, signature }),
      });
      const data = await verRes.json();

      if (data.access) {
        setStatus("granted");
        setMessage(`Access granted for ${shortAddr(data.address)}`);
      } else {
        setStatus("denied");
        setMessage(data.reason || "No NFT found.");
      }
    } catch (e: unknown) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <div style={styles.badge}>NFT</div>
        <h1 style={styles.title}>ABC NFT Gate</h1>
        <p style={styles.sub}>Prove ownership to unlock access</p>

        {wallet && (
          <div style={styles.walletPill}>
            <span style={styles.dot} />
            {shortAddr(wallet)}
          </div>
        )}

        {status !== "idle" && status !== "connecting" && status !== "checking" && (
          <div style={{ ...styles.banner, ...styles[status] }}>
            {status === "granted" && "✅ "}
            {status === "denied" && "🚫 "}
            {status === "error" && "⚠️ "}
            {message}
          </div>
        )}

        <div style={styles.actions}>
          {!wallet ? (
            <button
              style={styles.btn}
              onClick={connectWallet}
              disabled={status === "connecting"}
            >
              {status === "connecting" ? "Connecting…" : "Connect Wallet"}
            </button>
          ) : (
            <button
              style={{ ...styles.btn, ...styles.btnAccent }}
              onClick={checkAccess}
              disabled={status === "checking"}
            >
              {status === "checking" ? "Checking…" : "Check Access"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0d0d0f",
    fontFamily: "'Courier New', monospace",
  },
  card: {
    background: "#16161a",
    border: "1px solid #2a2a35",
    borderRadius: 16,
    padding: "48px 40px",
    width: 380,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    boxShadow: "0 0 60px rgba(100,80,255,0.08)",
  },
  badge: {
    background: "linear-gradient(135deg,#6c4fff,#a855f7)",
    color: "#fff",
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: 3,
    padding: "6px 14px",
    borderRadius: 99,
  },
  title: {
    color: "#f0eeff",
    fontSize: 26,
    fontWeight: 700,
    margin: 0,
    letterSpacing: -0.5,
  },
  sub: {
    color: "#6b6b80",
    fontSize: 13,
    margin: 0,
  },
  walletPill: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#1e1e28",
    border: "1px solid #2e2e40",
    borderRadius: 99,
    padding: "6px 16px",
    color: "#9090b0",
    fontSize: 13,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#4ade80",
    display: "inline-block",
  },
  banner: {
    width: "100%",
    borderRadius: 10,
    padding: "12px 16px",
    fontSize: 13,
    textAlign: "center",
    boxSizing: "border-box",
  },
  granted: {
    background: "rgba(74,222,128,0.12)",
    border: "1px solid rgba(74,222,128,0.3)",
    color: "#4ade80",
  },
  denied: {
    background: "rgba(248,113,113,0.12)",
    border: "1px solid rgba(248,113,113,0.3)",
    color: "#f87171",
  },
  error: {
    background: "rgba(251,191,36,0.10)",
    border: "1px solid rgba(251,191,36,0.3)",
    color: "#fbbf24",
  },
  actions: { width: "100%", marginTop: 8 },
  btn: {
    width: "100%",
    padding: "14px 0",
    borderRadius: 10,
    border: "1px solid #3a3a50",
    background: "#1e1e28",
    color: "#c0c0d8",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: 0.3,
  },
  btnAccent: {
    background: "linear-gradient(135deg,#6c4fff,#a855f7)",
    border: "none",
    color: "#fff",
  },
};