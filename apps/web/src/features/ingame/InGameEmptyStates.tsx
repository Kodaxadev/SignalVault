import { TerminalPanel, TerminalStatusStrip } from './TerminalFrame';

export function NoObjectContext() {
  return (
    <TerminalPanel title="Root" code="NO-LINK" tone="warning" headingLevel={3}>
      <div className="space-y-3 text-center">
        <TerminalStatusStrip tone="warning">NO OBJECT DETECTED</TerminalStatusStrip>
        <p className="text-xs text-zinc-400">
          Open a Signal Vault object-context link from EVE Frontier tooling to load dossier intel.
        </p>
      </div>
    </TerminalPanel>
  );
}

export function ObjectUnresolved() {
  return (
    <div className="border border-orange-700 bg-orange-950/30 p-3">
      <p className="font-mono text-xs uppercase text-orange-300">
        We have context for this object, but not a verified type yet.
      </p>
    </div>
  );
}

export function ManualClassificationNote() {
  return (
    <div className="border border-zinc-800 bg-black p-3">
      <p className="font-mono text-xs uppercase text-zinc-400">
        MANUAL CLASSIFICATION - useful for now, not yet verified by EVE data.
      </p>
    </div>
  );
}
