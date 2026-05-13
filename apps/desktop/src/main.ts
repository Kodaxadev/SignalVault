import "./styles.css";
import { shellProofStatus } from "./overlayState";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Signal Vault Companion root element was not found.");
}

const severityLabel = {
  critical: "CRIT",
  warning: "WARN",
  stable: "OK",
} as const;

app.innerHTML = `
  <section class="shell" aria-label="Signal Vault Companion shell proof">
    <header class="masthead">
      <div>
        <p class="eyebrow">${shellProofStatus.phase}</p>
        <h1>Signal Vault</h1>
      </div>
      <span class="status status-${shellProofStatus.bridgeState}">
        ${shellProofStatus.bridgeState}
      </span>
    </header>

    <section class="system-panel" aria-label="Current system">
      <p class="label">Current System</p>
      <p class="system">${shellProofStatus.systemName}</p>
      <p class="detail">${shellProofStatus.bridgeDetail}</p>
    </section>

    <section class="signal-list" aria-label="Companion signal preview">
      <div class="section-title">
        <span>Signals</span>
        <span>Local</span>
      </div>
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
    </section>

    <section class="checks" aria-label="Authority checks">
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
      <button type="button">Open Vault</button>
      <button type="button">Quick Note</button>
      <button type="button">Hide</button>
    </footer>
  </section>
`;
