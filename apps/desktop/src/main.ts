import "./styles.css";
import { fetchCompanionBridgeState } from "./bridge/bridgeClient";
import {
  formatBridgePairingToken,
  getBridgePairingToken,
} from "./bridge/bridgePairing";
import { formatBridgeStatus } from "./bridge/bridgeStatus";
import {
  formatBridgeSignals,
  formatBridgeSystemName,
  formatBridgeWarnings,
} from "./bridge/bridgeStateFormatter";
import type { BridgeWarningLevel } from "./bridge/bridgeTypes";
import { hideCompanionWindow } from "./companionWindow";
import { companionToggleHotkey } from "./hotkeys/hotkeyConfig";
import { formatHotkeyStatus } from "./hotkeys/hotkeyStatus";
import { registerCompanionHotkey } from "./hotkeys/registerCompanionHotkey";
import { shellProofStatus } from "./overlayState";
import { registerTrayStatus } from "./tray/registerTrayStatus";
import { formatTrayStatus } from "./tray/trayStatus";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Signal Vault Companion root element was not found.");
}

const severityLabel = {
  critical: "CRIT",
  warning: "WARN",
  stable: "OK",
} as const;

const bridgeWarningSeverity: Record<BridgeWarningLevel, keyof typeof severityLabel> = {
  critical: "critical",
  warning: "warning",
  info: "stable",
};

app.innerHTML = `
  <section class="shell" aria-label="Signal Vault Companion shell proof">
    <header class="masthead">
      <div>
        <p class="eyebrow">${shellProofStatus.phase}</p>
        <h1>Signal Vault</h1>
      </div>
      <span class="status status-${shellProofStatus.bridgeState}" data-bridge-badge>
        offline
      </span>
    </header>

    <section class="system-panel" aria-label="Current system">
      <p class="label">Current System</p>
      <p class="system" data-current-system>${shellProofStatus.systemName}</p>
      <p class="detail" data-bridge-status>${shellProofStatus.bridgeDetail}</p>
    </section>

    <section class="signal-list" aria-label="Companion signal preview">
      <div class="section-title">
        <span>Signals</span>
        <span>Local</span>
      </div>
      <div data-bridge-signals>
      ${shellProofStatus.latestSignals
        .map(
          (signal) => `
            <article class="signal signal-${signal.severity}">
              <span class="severity">${severityLabel[signal.severity]}</span>
              <span class="signal-label">${signal.label}</span>
              <span class="age">${signal.age}</span>
            </article>
          `,
        )
        .join("")}
      </div>
    </section>

    <section class="checks" aria-label="Authority checks">
      <div class="check-row">
        <span>Warnings</span>
        <strong data-warning-count>0</strong>
      </div>
      <div class="check-row">
        <span>Latest Signals</span>
        <strong data-signal-count>0</strong>
      </div>
      <div class="check-row">
        <span>Hotkey</span>
        <strong data-hotkey-status>${companionToggleHotkey}</strong>
      </div>
      <div class="check-row">
        <span>Tray</span>
        <strong data-tray-status>checking</strong>
      </div>
      <div class="check-row">
        <span>Pairing</span>
        <strong class="token-value" data-pairing-token>checking</strong>
      </div>
      ${shellProofStatus.checks
        .map(
          (check) => `
            <div class="check-row">
              <span>${check.label}</span>
              <strong>${check.value}</strong>
            </div>
          `,
        )
        .join("")}
    </section>

    <footer class="actions">
      <button type="button" disabled>Open Vault</button>
      <button type="button" disabled>Quick Note</button>
      <button type="button" data-action="hide">Hide</button>
    </footer>
  </section>
`;

app.querySelector('[data-action="hide"]')?.addEventListener("click", () => {
  void hideCompanionWindow();
});

const hotkeyStatus = app.querySelector<HTMLElement>("[data-hotkey-status]");
const trayStatus = app.querySelector<HTMLElement>("[data-tray-status]");
const pairingToken = app.querySelector<HTMLElement>("[data-pairing-token]");
const bridgeBadge = app.querySelector<HTMLElement>("[data-bridge-badge]");
const bridgeStatus = app.querySelector<HTMLElement>("[data-bridge-status]");
const currentSystem = app.querySelector<HTMLElement>("[data-current-system]");
const warningCount = app.querySelector<HTMLElement>("[data-warning-count]");
const signalCount = app.querySelector<HTMLElement>("[data-signal-count]");
const bridgeSignals = app.querySelector<HTMLElement>("[data-bridge-signals]");

void registerCompanionHotkey((status) => {
  if (hotkeyStatus) {
    hotkeyStatus.textContent = formatHotkeyStatus(status);
  }
});

registerTrayStatus((status) => {
  if (trayStatus) {
    trayStatus.textContent = formatTrayStatus(status);
  }
});

void getBridgePairingToken().then((result) => {
  if (pairingToken) {
    pairingToken.textContent = formatBridgePairingToken(result);
  }
});

async function refreshBridgeState(): Promise<void> {
  const result = await fetchCompanionBridgeState();

  if (result.status === "disconnected") {
    if (bridgeBadge) {
      bridgeBadge.textContent = "offline";
      bridgeBadge.className = "status status-offline";
    }
    if (bridgeStatus) {
      bridgeStatus.textContent = formatBridgeStatus("disconnected");
    }
    if (warningCount) {
      warningCount.textContent = "0";
    }
    if (signalCount) {
      signalCount.textContent = "0";
    }
    return;
  }

  const warnings = formatBridgeWarnings(result.state);
  const signals = formatBridgeSignals(result.state);

  if (bridgeBadge) {
    bridgeBadge.textContent = "connected";
    bridgeBadge.className = "status status-connected";
  }
  if (bridgeStatus) {
    bridgeStatus.textContent = formatBridgeStatus("connected");
  }
  if (currentSystem) {
    currentSystem.textContent = formatBridgeSystemName(result.state);
  }
  if (warningCount) {
    warningCount.textContent = String(result.state.warnings.length);
  }
  if (signalCount) {
    signalCount.textContent = String(result.state.latestSignals.length);
  }
  if (bridgeSignals) {
    bridgeSignals.innerHTML = signals
      .map((signal) => {
        const severity = warnings[0]
          ? bridgeWarningSeverity[warnings[0].level]
          : "stable";
        return `
          <article class="signal signal-${severity}">
            <span class="severity">${severityLabel[severity]}</span>
            <span class="signal-label">${signal.title}</span>
            <span class="age">${signal.confidence}</span>
          </article>
        `;
      })
      .join("");
  }
}

void refreshBridgeState();
window.setInterval(() => {
  void refreshBridgeState();
}, 5000);
