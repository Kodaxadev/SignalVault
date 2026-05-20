export type CompanionSeverity = "critical" | "warning" | "stable";

export interface CompanionStatus {
  readonly phase: string;
  readonly systemName: string;
  readonly bridgeState: "offline" | "connected";
  readonly bridgeDetail: string;
  readonly latestSignals: readonly CompanionSignal[];
  readonly checks: readonly CompanionCheck[];
}

export interface CompanionSignal {
  readonly id: string;
  readonly severity: CompanionSeverity;
  readonly label: string;
  readonly age: string;
}

export interface CompanionCheck {
  readonly label: string;
  readonly value: string;
}

export const shellProofStatus: CompanionStatus = {
  phase: "13A Companion",
  systemName: "OQQ-0R8",
  bridgeState: "offline",
  bridgeDetail: "Bridge awaiting paired browser state.",
  latestSignals: [
    {
      id: "static-shell-1",
      severity: "warning",
      label: "Route warning surface reserved",
      age: "static",
    },
    {
      id: "static-shell-2",
      severity: "stable",
      label: "Wallet authority absent by design",
      age: "verified",
    },
  ],
  checks: [
    { label: "Wallet signing", value: "off" },
    { label: "dApp provider", value: "none" },
    { label: "Game process access", value: "none" },
  ],
};
