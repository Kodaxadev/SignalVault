# Quick Action Catalog

## Purpose

Quick actions are the heart of in-game usability. They let players log useful Signals without typing long notes.

## Quick Action Schema

```ts
export type QuickSignalAction = {
  id: string;
  label: string;
  entityTypes: EntityType[];
  signalType: SignalType;
  defaultConfidence: SignalConfidence;
  defaultVisibility: SignalVisibility;
  tags: string[];
  riskDelta?: "green" | "amber" | "red" | "black";
  requiresAuthForRemote: boolean;
};
```

## Gate Quick Actions

### Passed

Creates:

- `signalType: gate_recon`
- `confidence: observed`
- tags: `gate`, `passed`

Effect:

- supports gate as usable
- may reduce risk
- may contradict recent blocked report

### Blocked

Creates:

- `signalType: access_denied`
- `confidence: observed`
- tags: `gate`, `blocked`

Effect:

- raises risk
- may mark route amber/red
- may contradict recent passed report

### Permit Required

Creates:

- `signalType: permit_report`
- `confidence: observed`
- tags: `gate`, `permit_required`

Effect:

- marks access restricted
- raises route caution

### Toll Suspected

Creates:

- `signalType: permit_report`
- tags: `gate`, `toll`

Effect:

- adds access/economics note

### Hostile Nearby

Creates:

- `signalType: hostile_contact`
- tags: `hostile`, `gate_exit` or `gate_area`

Effect:

- raises route/system risk

## Storage Quick Actions

### Access Worked

Creates:

- `signalType: storage_manifest`
- tags: `storage`, `access_worked`

### Access Denied

Creates:

- `signalType: access_denied`
- tags: `storage`, `access_denied`

### Update Manifest

Creates/opens:

- `signalType: storage_manifest`

Requires text entry.

### Mark Empty

Creates:

- `signalType: storage_manifest`
- tags: `storage`, `empty`

### Mark Stale

Creates or updates:

- staleness marker

## Market Quick Actions

### Market Open

Creates:

- `signalType: market_report`
- tags: `market`, `open`

### Market Closed

Creates:

- `signalType: market_report`
- tags: `market`, `closed`

### Poor Liquidity

Creates:

- `signalType: market_report`
- tags: `market`, `poor_liquidity`

### Good Trade Point

Creates:

- `signalType: market_report`
- tags: `market`, `good_trade_point`

### Hostile Trade Hub

Creates:

- `signalType: market_report`
- tags: `market`, `hostile`

## Route Quick Actions

### Route Safe

Creates:

- `signalType: route_report`
- tags: `route`, `safe`

### Route Unsafe

Creates:

- `signalType: route_report`
- tags: `route`, `unsafe`

### Re-Scout Needed

Creates:

- `signalType: route_report`
- tags: `route`, `rescout`

### Blocked Hop

Creates:

- `signalType: route_report`
- tags: `route`, `blocked_hop`

## System Quick Actions

### Hostile System

Creates:

- `signalType: hostile_contact`
- tags: `system`, `hostile`

### Resource Found

Creates:

- `signalType: resource_report`
- tags: `system`, `resource`

### Storage Found

Creates:

- `signalType: field_note`
- tags: `system`, `storage_found`

### Market Found

Creates:

- `signalType: market_report`
- tags: `system`, `market_found`

## Unknown Object Quick Actions

### Log Field Signal

Creates:

- `signalType: field_note`
- tags: `unknown_object`

### Classify Object

Opens classification panel.

### Connect Identity

Opens identity panel.

## Authentication Rules

Anonymous users:

- can create local-only quick Signals
- cannot publish remote/shared quick Signals

Wallet/character users:

- can save private Signals
- can publish according to visibility/role
