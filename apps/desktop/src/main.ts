import "./styles.css";
import { fetchCompanionBridgeState } from "./bridge/bridgeClient";
import {
  formatBridgeHostStatus,
  getBridgeHostStatus,
} from "./bridge/bridgeHostStatus";
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
import { queueCurrentSystem } from "./currentSystem/queueCurrentSystem";
import { companionToggleHotkey } from "./hotkeys/hotkeyConfig";
import { formatHotkeyStatus } from "./hotkeys/hotkeyStatus";
import { registerCompanionHotkey } from "./hotkeys/registerCompanionHotkey";
import { openVault } from "./openVault";
import { shellProofStatus } from "./overlayState";
import { queueQuickNote } from "./quickNote/queueQuickNote";
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
        <span>Bridge Host</span>
        <strong data-bridge-host-status>checking</strong>
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

    <section class="quick-note" aria-label="Quick note capture">
      <label class="label" for="quick-note-body">Quick Note</label>
      <textarea id="quick-note-body" data-quick-note-body maxlength="500"></textarea>
    </section>

    <section class="current-system-entry" aria-label="Set current system">
      <label class="label" for="current-system-input">Set Current System</label>
      <input id="current-system-input" data-current-system-input maxlength="100" />
    </section>

    <footer class="actions">
      <button type="button" data-action="open-vault">Open Vault</button>
      <button type="button" data-action="quick-note">Quick Note</button>
      <button type="button" data-action="set-current-system">Set System</button>
      <button type="button" data-action="hide">Hide</button>
    </footer>
    <p class="action-status" data-action-status></p>
  </section>
`;

app.querySelector('[data-action="hide"]')?.addEventListener("click", () => {
  void hideCompanionWindow();
});

app.querySelector('[data-action="open-vault"]')?.addEventListener("click", () => {
  void openVault().then((result) => {
    const status = app.querySelector<HTMLElement>("[data-action-status]");
    if (!status) return;

    if (result.status === "opened") {
      status.textContent = "Vault opened in browser.";
    } else if (result.status === "invalid_url") {
      status.textContent = "Open Vault URL is invalid.";
    } else {
      status.textContent = "Open Vault failed.";
    }
  });
});

app.querySelector('[data-action="quick-note"]')?.addEventListener("click", () => {
  const input = app.querySelector<HTMLTextAreaElement>("[data-quick-note-body]");
  const status = app.querySelector<HTMLElement>("[data-action-status]");
  const body = input?.value ?? "";

  void queueQuickNote({ body, currentSystemName: latestSystemName }).then((result) => {
    if (!status) return;

    if (result.status === "queued") {
      status.textContent = "Quick note queued.";
      if (input) input.value = "";
    } else if (result.status === "invalid" && result.reason === "empty") {
      status.textContent = "Quick note is empty.";
    } else if (result.status === "invalid") {
      status.textContent = "Quick note is too long.";
    } else {
      status.textContent = "Quick note failed.";
    }
  });
});

app.querySelector('[data-action="set-current-system"]')?.addEventListener("click", () => {
  const input = app.querySelector<HTMLInputElement>("[data-current-system-input]");
  const status = app.querySelector<HTMLElement>("[data-action-status]");
  const systemInput = input?.value ?? "";

  void queueCurrentSystem({ systemInput }).then((result) => {
    if (!status) return;

    if (result.status === "queued") {
      status.textContent = "Current system queued.";
      if (input) input.value = "";
    } else if (result.status === "invalid" && result.reason === "empty") {
      status.textContent = "Current system is empty.";
    } else if (result.status === "invalid") {
      status.textContent = "Current system is too long.";
    } else {
      status.textContent = "Current system failed.";
    }
  });
});

const hotkeyStatus = app.querySelector<HTMLElement>("[data-hotkey-status]");
const trayStatus = app.querySelector<HTMLElement>("[data-tray-status]");
const bridgeHostStatus = app.querySelector<HTMLElement>("[data-bridge-host-status]");
const pairingToken = app.querySelector<HTMLElement>("[data-pairing-token]");
const bridgeBadge = app.querySelector<HTMLElement>("[data-bridge-badge]");
const bridgeStatus = app.querySelector<HTMLElement>("[data-bridge-status]");
const currentSystem = app.querySelector<HTMLElement>("[data-current-system]");
const warningCount = app.querySelector<HTMLElement>("[data-warning-count]");
const signalCount = app.querySelector<HTMLElement>("[data-signal-count]");
const bridgeSignals = app.querySelector<HTMLElement>("[data-bridge-signals]");
let latestSystemName: string | undefined;

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

void getBridgeHostStatus().then((status) => {
  if (bridgeHostStatus) {
    bridgeHostStatus.textContent = formatBridgeHostStatus(status);
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
    const systemName = formatBridgeSystemName(result.state);
    currentSystem.textContent = systemName;
    latestSystemName = result.state.currentSystem?.name;
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
